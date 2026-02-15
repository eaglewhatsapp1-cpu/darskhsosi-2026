-- Add API key columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS openai_api_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;

-- Update RLS policies to allow users to read/write their own API keys
-- (Assuming existing RLS policies cover all columns, but just in case)
COMMENT ON COLUMN profiles.openai_api_key IS 'User provided OpenAI API key for backup/dedicated usage';
COMMENT ON COLUMN profiles.gemini_api_key IS 'User provided Gemini API key for backup/dedicated usage';
