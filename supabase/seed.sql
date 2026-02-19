-- ============================================================
-- Kylian Roger Portfolio — Seed Data
-- ============================================================
-- Run this AFTER schema.sql to populate initial content.
-- This migrates the current static site data into Supabase.
-- Adjust image URLs to point to your Supabase Storage after uploading.
-- ============================================================

-- ── Site Settings ────────────────────────────────────────────
-- (Already inserted by schema.sql, just update)
UPDATE site_settings SET
  hero_title_top = 'KYLIAN',
  hero_title_bottom = 'ROGER',
  hero_role = 'MULTIDISCIPLINARY ARTIST',
  hero_based = 'AVAILABLE WORLDWIDE',
  about_text_html = '<p class="text-size-large">Kylian works across <a href="photography.html" class="about-hover-link" data-hover-img-key="photography"><span class="gif photography">photography</span></a>, <a href="film-motion.html" class="about-hover-link" data-hover-img-key="directing"><span class="gif directing">directing</span></a>, and <a href="art-direction.html" class="about-hover-link" data-hover-img-key="art-direction"><span class="gif art-directing">art direction</span></a>, creating advertising work in automotive, sport, and lifestyle, with a parallel editorial practice and independent creative projects that explore identity.</p>',
  works_section_title = 'LATEST<br>WORKS',
  works_section_links = '[{"label":"STILL","href":"photography.html"},{"label":"MOTION","href":"film-motion.html"}]'::jsonb,
  footer_big_name = 'KYLIAN ROGER',
  copyright_text = '© 2026 KYLIAN ROGER'
WHERE id = 'global';

-- ── Contact Page ─────────────────────────────────────────────
UPDATE contact_page SET
  title = 'CONTACT',
  bio_html = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
  awards_title = 'AWARDS',
  bts_title = 'BEHIND THE SCENES'
WHERE id = 'main';

-- ── Contact Info Blocks ──────────────────────────────────────
INSERT INTO contact_info_blocks (label, email, phone, sort_order) VALUES
  ('United States', 'kylian@rogerusa.com', '+1 (212) 555-1234', 0),
  ('France', 'kylian@rogerfrance.com', '+33 6 12 34 56 78', 1);

-- ── Awards ───────────────────────────────────────────────────
INSERT INTO awards (award_name, organizer, year, sort_order) VALUES
  ('Honorable Mention', 'International Photo Awards', '2023', 0),
  ('Selected Artist', 'PhotoVogue', '2023', 1),
  ('Street Fashion Feature', 'British Journal of Photography', '2022', 2),
  ('Open Competition', 'Sony World Photography Awards', '2022', 3),
  ('Finalist – Portrait Awards', 'LensCulture', '2021', 4);

-- ── Media Kit Buttons ───────────────────────────────────────
INSERT INTO media_kit_buttons (label, file_url, sort_order) VALUES
  ('Download Kit Média', '', 0);

-- ── Sample Photography Projects ──────────────────────────────
INSERT INTO projects (slug, category, title, year, sort_order, is_published, photo_subcategory, photo_location)
VALUES
  ('project-01', 'photography', 'PROJECT 01', 2026, 0, true, 'automotive', 'Paris, France'),
  ('project-02', 'photography', 'PROJECT 02', 2025, 1, true, 'sport', 'London, UK'),
  ('project-03', 'photography', 'PROJECT 03', 2025, 2, true, 'lifestyle', 'New York, USA'),
  ('project-04', 'photography', 'PROJECT 04', 2025, 3, true, 'editorial', 'Paris, France'),
  ('project-05', 'photography', 'PROJECT 05', 2025, 4, true, 'personal', 'Tokyo, Japan'),
  ('project-06', 'photography', 'PROJECT 06', 2024, 5, true, 'automotive', 'Milan, Italy');

-- ── Sample Art Direction Project ─────────────────────────────
INSERT INTO projects (slug, category, title, year, sort_order, is_published, art_client, art_role, art_description, art_tags, art_hero_label)
VALUES
  ('eclipse-urbaine', 'art-direction', 'ÉCLIPSE URBAINE', 2026, 0, true,
   'Maison Éclipse', 'Direction artistique, Conception visuelle',
   'Direction artistique complète pour une campagne de mode urbaine. Conception des visuels, choix des lieux de shooting et direction des mannequins.',
   ARRAY['Campagne', 'Mode'], 'CAMPAGNE · MODE');

-- ── Pages SEO (already seeded in schema, update with full data) ──
UPDATE pages_seo SET
  meta_title = 'Kylian Roger — Photographe, Réalisateur & Directeur Artistique',
  meta_description = 'Portfolio de Kylian Roger, artiste multidisciplinaire basé à Londres. Photographie, réalisation et direction artistique pour l''automobile, le sport, le lifestyle et des projets éditoriaux.',
  og_title = 'Kylian Roger — Photographe, Réalisateur & Directeur Artistique',
  og_description = 'Portfolio de Kylian Roger, artiste multidisciplinaire basé à Londres.'
WHERE page_slug = 'home';

UPDATE pages_seo SET
  meta_title = 'Photographie — Kylian Roger | Portfolio',
  meta_description = 'Découvrez les projets photographiques de Kylian Roger : automobile, sport, lifestyle, éditorial et projets personnels explorant l''identité.',
  og_title = 'Photographie — Kylian Roger'
WHERE page_slug = 'photography';

UPDATE pages_seo SET
  meta_title = 'Film & Motion — Kylian Roger | Portfolio',
  meta_description = 'Films, clips et motion design par Kylian Roger. Brand films, documentaires, publicités et courts-métrages.',
  og_title = 'Film & Motion — Kylian Roger'
WHERE page_slug = 'film-motion';

UPDATE pages_seo SET
  meta_title = 'Direction Artistique — Kylian Roger | Portfolio',
  meta_description = 'Projets de direction artistique par Kylian Roger : campagnes mode, branding, identité visuelle.',
  og_title = 'Direction Artistique — Kylian Roger'
WHERE page_slug = 'art-direction';

UPDATE pages_seo SET
  meta_title = 'Contact — Kylian Roger | Photographe & Directeur Artistique',
  meta_description = 'Contactez Kylian Roger pour vos projets photo, film ou direction artistique. Disponible dans le monde entier.',
  og_title = 'Contact — Kylian Roger'
WHERE page_slug = 'contact';

-- ============================================================
-- NOTE: After running this seed, you need to:
-- 1. Upload images to Supabase Storage buckets
-- 2. Update image URLs in the tables (hero_images, projects cover, etc.)
-- 3. Create an admin user in Supabase Auth
-- ============================================================
