-- Add image_url column to sculptures table
ALTER TABLE sculptures ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing sculptures with a placeholder
UPDATE sculptures SET image_url = '/placeholder.svg?height=80&width=80' WHERE image_url IS NULL;
