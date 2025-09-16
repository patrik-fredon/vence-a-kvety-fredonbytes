-- Create contact_forms table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON contact_forms(status);
CREATE INDEX IF NOT EXISTS idx_contact_forms_created_at ON contact_forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_forms_email ON contact_forms(email);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_contact_forms_updated_at ON contact_forms;
CREATE TRIGGER update_contact_forms_updated_at
  BEFORE UPDATE ON contact_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

-- Policy for public to insert contact forms (no authentication required)
CREATE POLICY "Anyone can submit contact forms" ON contact_forms
  FOR INSERT WITH CHECK (true);

-- Policy for authenticated users to view their own submissions (if we add user_id later)
-- This is disabled for now since we don't have user authentication for contact forms
-- CREATE POLICY "Users can view own contact forms" ON contact_forms
--   FOR SELECT USING (auth.uid() IS NOT NULL);

-- Add comments for documentation
COMMENT ON TABLE contact_forms IS 'Stores contact form submissions from the website';
COMMENT ON COLUMN contact_forms.name IS 'Full name of the person submitting the form';
COMMENT ON COLUMN contact_forms.email IS 'Email address of the person submitting the form';
COMMENT ON COLUMN contact_forms.phone IS 'Optional phone number';
COMMENT ON COLUMN contact_forms.subject IS 'Subject/category of the inquiry';
COMMENT ON COLUMN contact_forms.message IS 'The actual message content';
COMMENT ON COLUMN contact_forms.status IS 'Processing status of the contact form';
COMMENT ON COLUMN contact_forms.ip_address IS 'IP address of the submitter for security purposes';
COMMENT ON COLUMN contact_forms.user_agent IS 'Browser user agent for security purposes';
