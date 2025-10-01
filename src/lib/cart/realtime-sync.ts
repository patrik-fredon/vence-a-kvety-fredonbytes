/**
 * Real-time cart synchronization utilities
 * Provides WebSocket-based real-time updates and enhanced conflict resolution
 */

import type { CartItem, CartSummary } from "@/types/cart";

export interface CartSyncEvent {
  type: "cart_updated" | "item_added" | "item_removed" | "item_updated";
  userId?: string;
  sessionId?: string;
  data: CartSummary | CartItem;
  timestamp: number;
  source: "local" | "remote";
}

export interface ConflictResolution {
  strategy: "server_wins" | "client_wins" | "merge" | "prompt_user";
  resolvedCart: CartSummary;
  conflicts: CartConflict[];
}

export interface CartConflict {
  itemId: string;
  field: "quantity" | "customizations";
  localValue: any;
  serverValue: any;
  resolution: "local" | "server" | "merged";
}

/**
 * Enhanced real-time cart synchronization manager
 */
export class CartSyncManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, ((event: CartSyncEvent) => void)[]> = new Map();

  constructor(
    private userId?: string,
    private sessionId?: string
  ) { }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  async connect(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/cart/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("Cart sync WebSocket connected");
        this.reconnectAttempts = 0;
        this.startHeartbeat();

        // Send authentication
        this.send({
          type: "auth",
          userId: this.userId,
          sessionId: this.sessionId,
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("Cart sync WebSocket disconnected");
        this.stopHeartbeat();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("Cart sync WebSocket error:", error);
      };

      return true;
    } catch (error) {
      console.error("Failed to connect to cart sync WebSocket:", error);
      return false;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
  }

  /**
   * Send message through WebSocket
   */
  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    if (data.type === "cart_sync") {
      const event: CartSyncEvent = {
        ...data,
        e: "remote",
      };
      this.emit("sync", event);
    } else if (data.type === "pong") {
      // Heartbeat response
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: "ping" });
    }, 30000);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    const delay = this.reconnectDelay * 2 ** this.reconnectAttempts;
    this.reconnectAttempts++;

    setTimeout(() => {
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      this.connect();
    }, delay);
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (event: CartSyncEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (event: CartSyncEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: CartSyncEvent): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  /**
   * Broadcast cart change to other clients
   */
  broadcastCartChange(event: CartSyncEvent): void {
    const { type, ...eventData } = event;
    this.send({
      type: "cart_change",
      ...eventData,
      source: "local",
    });
  }
}

/**
 * Advanced conflict resolution for cart synchronization
 */
export class CartConflictResolver {
  /**
   * Resolve conflicts between local and server cart state
   */
  static resolveConflicts(
    localCart: CartSummary,
    serverCart: CartSummary,
    strategy: ConflictResolution["strategy"] = "merge"
  ): ConflictResolution {
    const conflicts: CartConflict[] = [];
    let resolvedCart: CartSummary;

    switch (strategy) {
      case "server_wins":
        resolvedCart = serverCart;
        break;

      case "client_wins":
        resolvedCart = localCart;
        break;

      case "merge":
        resolvedCart = CartConflictResolver.mergeCartStates(localCart, serverCart, conflicts);
        break;

      default:
        resolvedCart = serverCart;
    }

    return {
      strategy,
      resolvedCart,
      conflicts,
    };
  }

  /**
   * Merge local and server cart states intelligently
   */
  private static mergeCartStates(
    localCart: CartSummary,
    serverCart: CartSummary,
    conflicts: CartConflict[]
  ): CartSummary {
    const mergedItems: CartItem[] = [];
    const processedIds = new Set<string>();

    // Process server items first
    for (const serverItem of serverCart.items) {
      const localItem = localCart.items.find((item) => item.id === serverItem.id);

      if (localItem) {
        // Item exists in both - check for conflicts
        const mergedItem = CartConflictResolver.mergeCartItems(localItem, serverItem, conflicts);
        mergedItems.push(mergedItem);
      } else {
        // Item only exists on server
        mergedItems.push(serverItem);
      }

      processedIds.add(serverItem.id);
    }

    // Add local-only items (optimistic updates not yet confirmed)
    for (const localItem of localCart.items) {
      if (!processedIds.has(localItem.id)) {
        // Check if this is a temporary optimistic item
        if (localItem.id.startsWith("temp_")) {
          // Keep optimistic items for now
          mergedItems.push(localItem);
        }
      }
    }

    // Recalculate totals
    const itemCount = mergedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = mergedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    return {
      items: mergedItems,
      itemCount,
      subtotal,
      total: subtotal, // Add taxes, delivery, etc. later
    };
  }

  /**
   * Merge individual cart items and detect conflicts
   */
  private static mergeCartItems(
    localItem: CartItem,
    serverItem: CartItem,
    conflicts: CartConflict[]
  ): CartItem {
    const mergedItem = { ...serverItem }; // Start with server version

    // Check quantity conflict
    if (localItem.quantity !== serverItem.quantity) {
      conflicts.push({
        itemId: localItem.id,
        field: "quantity",
        localValue: localItem.quantity,
        serverValue: serverItem.quantity,
        resolution: "server", // Default to server for quantity
      });
    }

    // Check customizations conflict
    const localCustomizations = JSON.stringify(localItem.customizations);
    const serverCustomizations = JSON.stringify(serverItem.customizations);

    if (localCustomizations !== serverCustomizations) {
      conflicts.push({
        itemId: localItem.id,
        field: "customizations",
        localValue: localItem.customizations,
        serverValue: serverItem.customizations,
        resolution: "server", // Default to server for customizations
      });
    }

    return mergedItem;
  }
}

/**
 * Enhanced cart persistence with versioning
 */
export class CartPersistenceManager {
  private static readonly STORAGE_KEY = "cart_state_v2";
  private static readonly VERSION = 2;

  /**
   * Save cart state with version and timestamp
   */
  static saveCartState(cart: CartSummary, version: number = Date.now()): void {
    if (typeof window === "undefined") return;

    try {
      const stateData = {
        version: CartPersistenceManager.VERSION,
        timestamp: Date.now(),
        cartVersion: version,
        cart,
      };

      localStorage.setItem(CartPersistenceManager.STORAGE_KEY, JSON.stringify(stateData));
    } catch (error) {
      console.warn("Failed to save cart state:", error);
    }
  }

  /**
   * Load cart state with version checking
   */
  static loadCartState(): { cart: CartSummary; version: number } | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(CartPersistenceManager.STORAGE_KEY);
      if (!stored) return null;

      const stateData = JSON.parse(stored);

      // Check version compatibility
      if (stateData.version !== CartPersistenceManager.VERSION) {
        console.warn("Cart state version mismatch, clearing storage");
        CartPersistenceManager.clearCartState();
        return null;
      }

      // Check if data is too old (24 hours)
      const age = Date.now() - stateData.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        console.warn("Cart state too old, clearing storage");
        CartPersistenceManager.clearCartState();
        return null;
      }

      return {
        cart: stateData.cart,
        version: stateData.cartVersion,
      };
    } catch (error) {
      console.warn("Failed to load cart state:", error);
      CartPersistenceManager.clearCartState();
      return null;
    }
  }

  /**
   * Clear stored cart state
   */
  static clearCartState(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(CartPersistenceManager.STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear cart state:", error);
    }
  }
}
