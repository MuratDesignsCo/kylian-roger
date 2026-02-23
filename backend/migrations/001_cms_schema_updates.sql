-- Migration 001: CMS schema updates (feat-cms)
-- Ajout colonnes, tables et données pour le panel admin CMS

-- ============================================================
-- 1. site_settings — nouvelles colonnes
-- ============================================================
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS navbar_logo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_logo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nav_menu_order JSONB NOT NULL DEFAULT '["home", "works", "contact"]'::jsonb;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nav_dropdown_order JSONB NOT NULL DEFAULT '["photography", "film-motion", "art-direction"]'::jsonb;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS works_section_subtitle TEXT NOT NULL DEFAULT 'Explore more';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_logo_top_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_logo_bottom_url TEXT NOT NULL DEFAULT '';

-- ============================================================
-- 2. projects — nouvelles colonnes
-- ============================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_title TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_description TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS og_title TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS og_description TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS og_image_url TEXT NOT NULL DEFAULT '';

-- ============================================================
-- 3. page_settings — nouvelle table
-- ============================================================
CREATE TABLE IF NOT EXISTS page_settings (
  page_slug TEXT PRIMARY KEY,
  page_title TEXT,
  items_per_page INTEGER DEFAULT 9,
  items_per_page_alt INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO page_settings (page_slug, page_title, items_per_page, items_per_page_alt) VALUES
  ('photography', 'PHOTOGRAPHY', 9, NULL),
  ('film-motion', 'FILM / MOTION', NULL, NULL),
  ('art-direction', 'ART DIRECTION', 6, 6)
ON CONFLICT (page_slug) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tr_page_settings_updated'
  ) THEN
    CREATE TRIGGER tr_page_settings_updated
      BEFORE UPDATE ON page_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END;
$$;

-- ============================================================
-- 4. about_hover_images — corriger les link_identifier
-- ============================================================
UPDATE about_hover_images SET link_identifier = '/photography'   WHERE link_identifier = 'photography';
UPDATE about_hover_images SET link_identifier = '/film-motion'   WHERE link_identifier = 'directing';
UPDATE about_hover_images SET link_identifier = '/art-direction' WHERE link_identifier = 'art-direction';

-- ============================================================
-- 5. pages_seo — enrichir og_title / og_description
-- ============================================================
UPDATE pages_seo SET
  meta_description = 'Portfolio de Kylian Roger, artiste multidisciplinaire. Photographie, réalisation et direction artistique pour l''automobile, le sport, le lifestyle et des projets éditoriaux.',
  og_title = 'Kylian Roger — Portfolio',
  og_description = 'Photographe, réalisateur et directeur artistique. Découvrez le portfolio de Kylian Roger.'
WHERE page_slug = 'home' AND (og_title IS NULL OR og_title = '');

UPDATE pages_seo SET
  meta_description = 'Découvrez les projets photographiques de Kylian Roger : automobile, sport, mode, lifestyle et éditorial. Un regard unique entre lumière et mouvement.',
  og_title = 'Photographie — Kylian Roger',
  og_description = 'Projets photographiques de Kylian Roger : automobile, sport, mode, lifestyle et éditorial.'
WHERE page_slug = 'photography' AND (og_title IS NULL OR og_title = '');

UPDATE pages_seo SET
  meta_description = 'Projets vidéo et motion design de Kylian Roger : films publicitaires, clips, contenus automobile et sport. Réalisation et direction artistique.',
  og_title = 'Film / Motion — Kylian Roger',
  og_description = 'Films publicitaires, clips et motion design par Kylian Roger.'
WHERE page_slug = 'film-motion' AND (og_title IS NULL OR og_title = '');

UPDATE pages_seo SET
  meta_description = 'Projets de direction artistique par Kylian Roger : campagnes mode, branding, identité visuelle, scénographie et éditorial.',
  og_title = 'Direction Artistique — Kylian Roger',
  og_description = 'Direction artistique par Kylian Roger : campagnes mode, branding, identité visuelle et scénographie.'
WHERE page_slug = 'art-direction' AND (og_title IS NULL OR og_title = '');

UPDATE pages_seo SET
  meta_description = 'Contactez Kylian Roger pour vos projets photo, film ou direction artistique. Disponible en France et à l''international.',
  og_title = 'Contact — Kylian Roger',
  og_description = 'Contactez Kylian Roger pour vos projets photo, film ou direction artistique.'
WHERE page_slug = 'contact' AND (og_title IS NULL OR og_title = '');
