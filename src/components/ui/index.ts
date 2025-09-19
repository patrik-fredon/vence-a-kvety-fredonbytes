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
export { LoadingSpinner } from "./LoadingSpinner";
export { OptimizedImage } from "./OptimizedImage";
export { ErrorBoundary } from "./ErrorBoundary";
export { LazyWrapper } from "./LazyWrapper";

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
// FUTURE ATOMS (to be implemented)
// =============================================================================

// export { Text } from "./Text";
// export { Heading } from "./Heading";
// export { Icon } from "./Icon";
// export { Badge } from "./Badge";
// export { Avatar } from "./Avatar";
// export { Divider } from "./Divider";
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
// export { Card } from "./Card";
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
