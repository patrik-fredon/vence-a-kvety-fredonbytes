/**
 * Centralized icon imports for better tree-shaking and bundle optimization
 * Import icons from this module instead of directly from @heroicons/react
 */

// 20px solid icons for smaller UI elements
export {
  ChevronDownIcon as ChevronDownIcon20,
  ChevronUpIcon as ChevronUpIcon20,
  XMarkIcon as XMarkIcon20,
} from "@heroicons/react/20/solid";
// Outline icons - most commonly used
export {
  AdjustmentsHorizontalIcon,
  ArchiveBoxIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpIcon,
  BanknotesIcon,
  Bars3Icon,
  BellIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CogIcon,
  CreditCardIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassPlusIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SpeakerWaveIcon,
  StarIcon,
  TrashIcon,
  TruckIcon,
  UserCircleIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
// Solid icons - used sparingly for emphasis
export {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/solid";

/**
 * Icon component props for consistent usage
 */
export interface IconProps {
  className?: string;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

/**
 * Common icon sizes as Tailwind classes
 */
export const iconSizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
  "2xl": "w-10 h-10",
} as const;

/**
 * Helper function to get icon size class
 */
export function getIconSize(size: keyof typeof iconSizes = "md"): string {
  return iconSizes[size];
}
