-- Admin policies for contact_forms table
-- This migration should be run AFTER user_profiles table exists

-- Policy for admins to view all contact forms
CREATE POLICY "Admins can view all contact forms" ON contact_forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy for admins to update contact forms
CREATE POLICY "Admins can update contact forms" ON contact_forms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy for admins to delete contact forms (if needed)
CREATE POLICY "Admins can delete contact forms" ON contact_forms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );
