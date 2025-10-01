/**
 * Centralized icon imports for better tree-shaking and bundle optimization
 * Import icons from this module instead of directly from @heroicons/react
 */

// Outline icons - most commonly used
export {
  XMarkIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
  TruckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  BellIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  HomeIcon,
  XCircleIcon,
  MagnifyingGlassPlusIcon,
  SpeakerWaveIcon,
  AdjustmentsHorizontalIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  CheckIcon,
  BanknotesIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

// Solid icons - used sparingly for emphasis
export {
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
} from "@heroicons/react/24/solid";

// 20px solid icons for smaller UI elements
export {
  ChevronDownIcon as ChevronDownIcon20,
  ChevronUpIcon as ChevronUpIcon20,
  XMarkIcon as XMarkIcon20,
} from "@heroicons/react/20/solid";

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
