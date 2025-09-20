/**
 * UI Components - Atomic Design System
 *
 * This barrel export follows atomic design principles:
 * - Atoms: Basic building blocks (Button, Input, etc.)
 * - Molecules: Combinations of atoms (FormField, etc.)
 *
 * All exports are tree-shakeable and optimized for performance.
 */

// =============================================================================
// ATOMS - Basic building blocks
// =============================================================================

export { Button } from "./Button";
export { Input } from "./Input";
export { Text } from "./Text";
export { Heading } from "./Heading";
export { Badge } from "./Badge";
export { Divider } from "./Divider";
export { LoadingSpinner, LoadingState, PageLoadingState, ComponentLoadingState } from "./LoadingSpinner";
export { OptimizedImage } from "./OptimizedImage";
export { ErrorBoundary } from "./ErrorBoundary";
export { LazyWrapper } from "./LazyWrapper";

// =============================================================================
// MOLECULES - Combinations of atoms
// =============================================================================

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  InputProps,
  InputType,
  InputVariant,
} from "@/types/components";

// =============================================================================
// FUTURE COMPONENTS (to be implemented as needed)
// =============================================================================

// export { Icon } from "./Icon";
// export { Avatar } from "./Avatar";
// export { Skeleton } from "./Skeleton";
// export { Tooltip } from "./Tooltip";
// export { Switch } from "./Switch";
// export { Checkbox } from "./Checkbox";
// export { Radio } from "./Radio";
// export { Select } from "./Select";
// export { Textarea } from "./Textarea";
// export { Slider } from "./Slider";
// export { Progress } from "./Progress";
// export { Alert } from "./Alert";
// export { Modal } from "./Modal";
// export { Drawer } from "./Drawer";
// export { Popover } from "./Popover";
// export { Dropdown } from "./Dropdown";
// export { Tabs } from "./Tabs";
// export { Accordion } from "./Accordion";
// export { Breadcrumb } from "./Breadcrumb";
// export { Pagination } from "./Pagination";
// export { Table } from "./Table";
// export { DataTable } from "./DataTable";
