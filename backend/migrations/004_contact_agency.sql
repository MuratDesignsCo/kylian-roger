ALTER TABLE contact_info_blocks ADD COLUMN IF NOT EXISTS agency_name TEXT NOT NULL DEFAULT '';
ALTER TABLE contact_info_blocks ADD COLUMN IF NOT EXISTS agency_website TEXT NOT NULL DEFAULT '';
