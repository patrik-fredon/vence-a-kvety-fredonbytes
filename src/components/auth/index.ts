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

export { SignInForm } from "./SignInForm";
export { SignUpForm } from "./SignUpForm";
export { ForgotPasswordForm } from "./ForgotPasswordForm";
export { ResetPasswordForm } from "./ResetPasswordForm";

// =============================================================================
// USER PROFILE & PREFERENCES
// =============================================================================

export { UserProfile } from "./UserProfile";
export { UserPreferencesComponent } from "./UserPreferences";
export { AddressBook } from "./AddressBook";
