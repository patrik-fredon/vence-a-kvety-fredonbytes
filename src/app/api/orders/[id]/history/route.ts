import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { orderUtils } from '@/lib/supabase/utils';

/**
 * Get order status history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const orderId = params.id;

    // Get order history
    const { data: historyData, error } = await orderUtils.getOrderHistory(orderId);

    if (error || !historyData) {
      return NextResponse.json({
        success: false,
        error: 'Objednávka nebyla nalezena'
      }, { status: 404 });
    }

    const { order, statusHistory } = historyData;

    // Check if user has access to this order
    if (user && order.user_id && order.user_id !== user.id) {
      // Check if user is admin (implement based on your auth system)
      // For now, we'll allow access if user is authenticated
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: (order.customer_info as any).orderNumber || order.id.slice(-8).toUpperCase(),
        status: order.status,
        totalAmount: order.total_amount,
        createdAt: order.created_at
      },
      statusHistory
    });

  } catch (error) {
    console.error('Error in GET /api/orders/[id]/history:', error);
    return NextResponse.json({
      success: false,
      error: 'Interní chyba serveru'
    }, { status: 500 });
  }
}
