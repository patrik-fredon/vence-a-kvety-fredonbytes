/**
 * Authentication Components
 *
 * This barrel export provides all authentication-related components
 * including forms, providers, and user management utilities.
 */

// =============================================================================
// AUTHENTICATION PROVIDER & CONTEXT
// =============================================================================

export { AuthProvider, useAuthContext } from "./AuthProvider";
export { AuthStatus } from "./AuthStatus";

// =============================================================================
// AUTHENTICATION FORMS
// =============================================================================

export { ForgotPasswordForm } from "./ForgotPasswordForm";
export { ResetPasswordForm } from "./ResetPasswordForm";
export { SignInForm } from "./SignInForm";
export { SignUpForm } from "./SignUpForm";

// =============================================================================
// USER PROFILE & PREFERENCES
// =============================================================================

export { AddressBook } from "./AddressBook";
export { UserPreferencesComponent } from "./UserPreferences";
export { UserProfile } from "./UserProfile";
