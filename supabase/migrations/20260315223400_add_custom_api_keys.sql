-- Add custom API configuration columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_api_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_base_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_model TEXT;

-- Update RLS policies to allow users to read/write their own API keys
-- (Assuming existing RLS policies cover all columns, but just in case)
COMMENT ON COLUMN profiles.custom_api_key IS 'User provided Custom API key for dynamic model providers like OpenRouter or TogetherAI';
COMMENT ON COLUMN profiles.custom_base_url IS 'User provided Custom Base URL for the dynamic model provider (e.g., https://openrouter.ai/api/v1/chat/completions)';
COMMENT ON COLUMN profiles.custom_model IS 'User provided Custom Model identifier (e.g., meta-llama/llama-3-70b-instruct)';
