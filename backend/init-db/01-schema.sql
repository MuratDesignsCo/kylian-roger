-- ============================================================
-- Kylian Roger Portfolio — PostgreSQL Schema (standalone)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ADMIN USERS (JWT auth)
-- ============================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 1. SITE SETTINGS
-- ============================================================
CREATE TABLE site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  hero_title_top TEXT NOT NULL DEFAULT 'KYLIAN',
  hero_title_bottom TEXT NOT NULL DEFAULT 'ROGER',
  hero_role TEXT NOT NULL DEFAULT 'MULTIDISCIPLINARY ARTIST',
  hero_based TEXT NOT NULL DEFAULT 'AVAILABLE WORLDWIDE',
  about_text_html TEXT NOT NULL DEFAULT '',
  works_section_title TEXT NOT NULL DEFAULT 'LATEST WORKS',
  works_section_links JSONB NOT NULL DEFAULT '[{"label":"STILL","href":"photography.html"},{"label":"MOTION","href":"film-motion.html"}]'::jsonb,
  footer_big_name TEXT NOT NULL DEFAULT 'KYLIAN ROGER',
  copyright_text TEXT NOT NULL DEFAULT '© 2026 KYLIAN ROGER',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_settings (id) VALUES ('global');

-- ============================================================
-- 2. PAGES SEO
-- ============================================================
CREATE TABLE pages_seo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug TEXT UNIQUE NOT NULL,
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  og_title TEXT NOT NULL DEFAULT '',
  og_description TEXT NOT NULL DEFAULT '',
  og_image_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO pages_seo (page_slug, meta_title, meta_description) VALUES
  ('home', 'Kylian Roger — Photographe, Réalisateur & Directeur Artistique', 'Portfolio de Kylian Roger, artiste multidisciplinaire.'),
  ('photography', 'Photographie — Kylian Roger | Portfolio', 'Découvrez les projets photographiques de Kylian Roger.'),
  ('film-motion', 'Film / Motion — Kylian Roger | Portfolio', 'Découvrez les projets film et motion de Kylian Roger.'),
  ('art-direction', 'Art Direction — Kylian Roger | Portfolio', 'Découvrez les projets de direction artistique de Kylian Roger.'),
  ('contact', 'Contact — Kylian Roger | Photographe & Directeur Artistique', 'Contactez Kylian Roger pour vos projets.');

-- ============================================================
-- 3. HERO IMAGES
-- ============================================================
CREATE TABLE hero_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 4. ABOUT HOVER IMAGES
-- ============================================================
CREATE TABLE about_hover_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_identifier TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT ''
);

INSERT INTO about_hover_images (link_identifier) VALUES
  ('photography'), ('directing'), ('art-direction');

-- ============================================================
-- 5. PROJECTS
-- ============================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('photography', 'film-motion', 'art-direction')),
  title TEXT NOT NULL,
  cover_image_url TEXT NOT NULL DEFAULT '',
  cover_image_alt TEXT NOT NULL DEFAULT '',
  year INT NOT NULL DEFAULT 2026,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Photography-specific
  photo_subcategory TEXT,
  photo_location TEXT,
  -- Film/Motion-specific
  film_video_url TEXT,
  film_bg_image_url TEXT,
  film_subtitle TEXT,
  film_layout TEXT CHECK (film_layout IN ('landscape', 'vertical')),
  -- Art Direction-specific
  art_client TEXT,
  art_role TEXT,
  art_description TEXT,
  art_tags TEXT[] DEFAULT '{}',
  art_hero_label TEXT,
  -- Card display label
  card_label TEXT
);

CREATE INDEX idx_projects_category ON projects (category, sort_order);
CREATE INDEX idx_projects_slug ON projects (slug);

-- ============================================================
-- 6. PROJECT GALLERY ROWS
-- ============================================================
CREATE TABLE project_gallery_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  layout TEXT NOT NULL DEFAULT 'half' CHECK (layout IN ('full', 'half', 'third', 'quarter'))
);

CREATE INDEX idx_gallery_rows_project ON project_gallery_rows (project_id, sort_order);

-- ============================================================
-- 7. PROJECT GALLERY IMAGES
-- ============================================================
CREATE TABLE project_gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  row_id UUID NOT NULL REFERENCES project_gallery_rows(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_gallery_images_row ON project_gallery_images (row_id, sort_order);

-- ============================================================
-- 8. PROJECT HERO SLIDES
-- ============================================================
CREATE TABLE project_hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_hero_slides_project ON project_hero_slides (project_id, sort_order);

-- ============================================================
-- 9. PROJECT BLOCKS
-- ============================================================
CREATE TABLE project_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL CHECK (block_type IN ('gallery', 'context', 'deliverables')),
  sort_order INT NOT NULL DEFAULT 0,
  context_label TEXT,
  context_heading TEXT,
  context_text TEXT,
  gallery_layout TEXT CHECK (gallery_layout IN ('full', 'pair', 'trio', 'pair-full')),
  deliverables_items JSONB
);

CREATE INDEX idx_blocks_project ON project_blocks (project_id, sort_order);

-- ============================================================
-- 10. PROJECT BLOCK IMAGES
-- ============================================================
CREATE TABLE project_block_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id UUID NOT NULL REFERENCES project_blocks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  image_type TEXT NOT NULL DEFAULT 'landscape' CHECK (image_type IN ('landscape', 'portrait', 'full')),
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_block_images_block ON project_block_images (block_id, sort_order);

-- ============================================================
-- 11. HOMEPAGE FEATURED WORKS
-- ============================================================
CREATE TABLE homepage_featured_works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  slot_category TEXT NOT NULL CHECK (slot_category IN ('still', 'motion')),
  slot_index INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE (slot_category, slot_index)
);

-- ============================================================
-- 12. CONTACT PAGE
-- ============================================================
CREATE TABLE contact_page (
  id TEXT PRIMARY KEY DEFAULT 'main',
  title TEXT NOT NULL DEFAULT 'CONTACT',
  portrait_image_url TEXT NOT NULL DEFAULT '',
  portrait_image_alt TEXT NOT NULL DEFAULT '',
  bio_html TEXT NOT NULL DEFAULT '',
  awards_title TEXT NOT NULL DEFAULT 'AWARDS',
  bts_title TEXT NOT NULL DEFAULT 'BEHIND THE SCENES',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO contact_page (id) VALUES ('main');

-- ============================================================
-- 13. CONTACT INFO BLOCKS
-- ============================================================
CREATE TABLE contact_info_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 14. AWARDS
-- ============================================================
CREATE TABLE awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  award_name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  year TEXT NOT NULL,
  hover_image_url TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 15. MEDIA KIT BUTTONS
-- ============================================================
CREATE TABLE media_kit_buttons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  file_url TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 16. BTS IMAGES
-- ============================================================
CREATE TABLE bts_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT 'Behind the scenes',
  sort_order INT NOT NULL DEFAULT 0
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_site_settings_updated
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_pages_seo_updated
  BEFORE UPDATE ON pages_seo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_projects_updated
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_contact_page_updated
  BEFORE UPDATE ON contact_page
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
