ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_instagram_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_behance_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_linkedin_url TEXT NOT NULL DEFAULT '';
