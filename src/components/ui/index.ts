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

export { Badge } from "./Badge";
export { Button } from "./Button";
export { ErrorBoundary } from "./ErrorBoundary";
export { Input } from "./Input";
export { LazyWrapper } from "./LazyWrapper";
export {
  ComponentLoadingState,
  LoadingSpinner,
  LoadingState,
  PageLoadingState,
} from "./LoadingSpinner";
export { OptimizedImage } from "./OptimizedImage";
export { Text } from "./Text";

// =============================================================================
// MOLECULES - Combinations of atoms
// =============================================================================

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";
export { FormField, FormGroup, FormSection } from "./FormField";
export { ConfirmModal, Modal, ModalFooter } from "./Modal";

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
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
