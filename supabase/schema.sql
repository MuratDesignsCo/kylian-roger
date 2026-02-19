-- ============================================================
-- Kylian Roger Portfolio — Supabase Schema
-- ============================================================
-- Run this SQL in Supabase SQL Editor to set up the database.
-- Make sure to also create Storage buckets manually (see below).
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. SITE SETTINGS (global)
-- ============================================================
create table site_settings (
  id text primary key default 'global',
  hero_title_top text not null default 'KYLIAN',
  hero_title_bottom text not null default 'ROGER',
  hero_role text not null default 'MULTIDISCIPLINARY ARTIST',
  hero_based text not null default 'AVAILABLE WORLDWIDE',
  about_text_html text not null default '',
  works_section_title text not null default 'LATEST WORKS',
  works_section_links jsonb not null default '[{"label":"STILL","href":"photography.html"},{"label":"MOTION","href":"film-motion.html"}]'::jsonb,
  footer_big_name text not null default 'KYLIAN ROGER',
  copyright_text text not null default '© 2026 KYLIAN ROGER',
  updated_at timestamptz not null default now()
);

-- Insert default row
insert into site_settings (id) values ('global');

-- ============================================================
-- 2. PAGES SEO
-- ============================================================
create table pages_seo (
  id uuid primary key default uuid_generate_v4(),
  page_slug text unique not null,
  meta_title text not null default '',
  meta_description text not null default '',
  og_title text not null default '',
  og_description text not null default '',
  og_image_url text not null default '',
  updated_at timestamptz not null default now()
);

-- Seed default pages
insert into pages_seo (page_slug, meta_title, meta_description) values
  ('home', 'Kylian Roger — Photographe, Réalisateur & Directeur Artistique', 'Portfolio de Kylian Roger, artiste multidisciplinaire. Photographie, réalisation et direction artistique.'),
  ('photography', 'Photographie — Kylian Roger | Portfolio', 'Découvrez les projets photographiques de Kylian Roger.'),
  ('film-motion', 'Film / Motion — Kylian Roger | Portfolio', 'Découvrez les projets film et motion de Kylian Roger.'),
  ('art-direction', 'Art Direction — Kylian Roger | Portfolio', 'Découvrez les projets de direction artistique de Kylian Roger.'),
  ('contact', 'Contact — Kylian Roger | Photographe & Directeur Artistique', 'Contactez Kylian Roger pour vos projets photo, film ou direction artistique.');

-- ============================================================
-- 3. HERO IMAGES (homepage)
-- ============================================================
create table hero_images (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  alt_text text not null default '',
  sort_order int not null default 0
);

-- ============================================================
-- 4. ABOUT HOVER IMAGES
-- ============================================================
create table about_hover_images (
  id uuid primary key default uuid_generate_v4(),
  link_identifier text unique not null, -- 'photography', 'directing', 'art-direction'
  image_url text not null default '',
  alt_text text not null default ''
);

-- Seed defaults
insert into about_hover_images (link_identifier) values
  ('photography'), ('directing'), ('art-direction');

-- ============================================================
-- 5. PROJECTS
-- ============================================================
create table projects (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  category text not null check (category in ('photography', 'film-motion', 'art-direction')),
  title text not null,
  cover_image_url text not null default '',
  cover_image_alt text not null default '',
  year int not null default 2026,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Photography-specific
  photo_subcategory text,
  photo_location text,
  -- Film/Motion-specific
  film_video_url text,
  film_bg_image_url text,
  film_subtitle text,
  -- Art Direction-specific
  art_client text,
  art_role text,
  art_description text,
  art_tags text[] default '{}',
  art_hero_label text
);

-- Index for fast category filtering
create index idx_projects_category on projects (category, sort_order);
create index idx_projects_slug on projects (slug);

-- ============================================================
-- 6. PROJECT GALLERY ROWS (Photography)
-- ============================================================
create table project_gallery_rows (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  sort_order int not null default 0,
  layout text not null default 'half' check (layout in ('full', 'half', 'third', 'quarter'))
);

create index idx_gallery_rows_project on project_gallery_rows (project_id, sort_order);

-- ============================================================
-- 7. PROJECT GALLERY IMAGES
-- ============================================================
create table project_gallery_images (
  id uuid primary key default uuid_generate_v4(),
  row_id uuid not null references project_gallery_rows(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order int not null default 0
);

create index idx_gallery_images_row on project_gallery_images (row_id, sort_order);

-- ============================================================
-- 8. PROJECT HERO SLIDES (Art Direction)
-- ============================================================
create table project_hero_slides (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order int not null default 0
);

create index idx_hero_slides_project on project_hero_slides (project_id, sort_order);

-- ============================================================
-- 9. PROJECT BLOCKS (Art Direction — flexible content)
-- ============================================================
create table project_blocks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  block_type text not null check (block_type in ('gallery', 'context', 'deliverables')),
  sort_order int not null default 0,
  -- Context block fields
  context_label text,
  context_heading text,
  context_text text,
  -- Gallery block fields
  gallery_layout text check (gallery_layout in ('full', 'pair', 'trio', 'pair-full')),
  -- Deliverables fields
  deliverables_items jsonb
);

create index idx_blocks_project on project_blocks (project_id, sort_order);

-- ============================================================
-- 10. PROJECT BLOCK IMAGES
-- ============================================================
create table project_block_images (
  id uuid primary key default uuid_generate_v4(),
  block_id uuid not null references project_blocks(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  image_type text not null default 'landscape' check (image_type in ('landscape', 'portrait', 'full')),
  sort_order int not null default 0
);

create index idx_block_images_block on project_block_images (block_id, sort_order);

-- ============================================================
-- 11. HOMEPAGE FEATURED WORKS
-- ============================================================
create table homepage_featured_works (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  slot_category text not null check (slot_category in ('still', 'motion')),
  slot_index int not null default 0,
  sort_order int not null default 0,
  unique (slot_category, slot_index)
);

-- ============================================================
-- 12. CONTACT PAGE
-- ============================================================
create table contact_page (
  id text primary key default 'main',
  title text not null default 'CONTACT',
  portrait_image_url text not null default '',
  portrait_image_alt text not null default '',
  bio_html text not null default '',
  awards_title text not null default 'AWARDS',
  bts_title text not null default 'BEHIND THE SCENES',
  updated_at timestamptz not null default now()
);

-- Insert default row
insert into contact_page (id) values ('main');

-- ============================================================
-- 13. CONTACT INFO BLOCKS
-- ============================================================
create table contact_info_blocks (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  email text not null default '',
  phone text not null default '',
  sort_order int not null default 0
);

-- ============================================================
-- 14. AWARDS
-- ============================================================
create table awards (
  id uuid primary key default uuid_generate_v4(),
  award_name text not null,
  organizer text not null,
  year text not null,
  hover_image_url text not null default '',
  sort_order int not null default 0
);

-- ============================================================
-- 15. MEDIA KIT BUTTONS
-- ============================================================
create table media_kit_buttons (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  file_url text not null default '',
  sort_order int not null default 0
);

-- ============================================================
-- 16. BTS IMAGES
-- ============================================================
create table bts_images (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  alt_text text not null default 'Behind the scenes',
  sort_order int not null default 0
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_site_settings_updated
  before update on site_settings
  for each row execute function update_updated_at();

create trigger tr_pages_seo_updated
  before update on pages_seo
  for each row execute function update_updated_at();

create trigger tr_projects_updated
  before update on projects
  for each row execute function update_updated_at();

create trigger tr_contact_page_updated
  before update on contact_page
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table site_settings enable row level security;
alter table pages_seo enable row level security;
alter table hero_images enable row level security;
alter table about_hover_images enable row level security;
alter table projects enable row level security;
alter table project_gallery_rows enable row level security;
alter table project_gallery_images enable row level security;
alter table project_hero_slides enable row level security;
alter table project_blocks enable row level security;
alter table project_block_images enable row level security;
alter table homepage_featured_works enable row level security;
alter table contact_page enable row level security;
alter table contact_info_blocks enable row level security;
alter table awards enable row level security;
alter table media_kit_buttons enable row level security;
alter table bts_images enable row level security;

-- Public read access (for the front-end, via anon key)
create policy "Public read" on site_settings for select using (true);
create policy "Public read" on pages_seo for select using (true);
create policy "Public read" on hero_images for select using (true);
create policy "Public read" on about_hover_images for select using (true);
create policy "Public read" on projects for select using (true);
create policy "Public read" on project_gallery_rows for select using (true);
create policy "Public read" on project_gallery_images for select using (true);
create policy "Public read" on project_hero_slides for select using (true);
create policy "Public read" on project_blocks for select using (true);
create policy "Public read" on project_block_images for select using (true);
create policy "Public read" on homepage_featured_works for select using (true);
create policy "Public read" on contact_page for select using (true);
create policy "Public read" on contact_info_blocks for select using (true);
create policy "Public read" on awards for select using (true);
create policy "Public read" on media_kit_buttons for select using (true);
create policy "Public read" on bts_images for select using (true);

-- Authenticated write access (for admin panel)
-- site_settings
create policy "Admin write" on site_settings for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on site_settings for update using (auth.role() = 'authenticated');
create policy "Admin delete" on site_settings for delete using (auth.role() = 'authenticated');

-- pages_seo
create policy "Admin write" on pages_seo for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on pages_seo for update using (auth.role() = 'authenticated');
create policy "Admin delete" on pages_seo for delete using (auth.role() = 'authenticated');

-- hero_images
create policy "Admin write" on hero_images for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on hero_images for update using (auth.role() = 'authenticated');
create policy "Admin delete" on hero_images for delete using (auth.role() = 'authenticated');

-- about_hover_images
create policy "Admin write" on about_hover_images for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on about_hover_images for update using (auth.role() = 'authenticated');
create policy "Admin delete" on about_hover_images for delete using (auth.role() = 'authenticated');

-- projects
create policy "Admin write" on projects for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on projects for update using (auth.role() = 'authenticated');
create policy "Admin delete" on projects for delete using (auth.role() = 'authenticated');

-- project_gallery_rows
create policy "Admin write" on project_gallery_rows for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on project_gallery_rows for update using (auth.role() = 'authenticated');
create policy "Admin delete" on project_gallery_rows for delete using (auth.role() = 'authenticated');

-- project_gallery_images
create policy "Admin write" on project_gallery_images for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on project_gallery_images for update using (auth.role() = 'authenticated');
create policy "Admin delete" on project_gallery_images for delete using (auth.role() = 'authenticated');

-- project_hero_slides
create policy "Admin write" on project_hero_slides for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on project_hero_slides for update using (auth.role() = 'authenticated');
create policy "Admin delete" on project_hero_slides for delete using (auth.role() = 'authenticated');

-- project_blocks
create policy "Admin write" on project_blocks for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on project_blocks for update using (auth.role() = 'authenticated');
create policy "Admin delete" on project_blocks for delete using (auth.role() = 'authenticated');

-- project_block_images
create policy "Admin write" on project_block_images for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on project_block_images for update using (auth.role() = 'authenticated');
create policy "Admin delete" on project_block_images for delete using (auth.role() = 'authenticated');

-- homepage_featured_works
create policy "Admin write" on homepage_featured_works for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on homepage_featured_works for update using (auth.role() = 'authenticated');
create policy "Admin delete" on homepage_featured_works for delete using (auth.role() = 'authenticated');

-- contact_page
create policy "Admin write" on contact_page for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on contact_page for update using (auth.role() = 'authenticated');
create policy "Admin delete" on contact_page for delete using (auth.role() = 'authenticated');

-- contact_info_blocks
create policy "Admin write" on contact_info_blocks for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on contact_info_blocks for update using (auth.role() = 'authenticated');
create policy "Admin delete" on contact_info_blocks for delete using (auth.role() = 'authenticated');

-- awards
create policy "Admin write" on awards for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on awards for update using (auth.role() = 'authenticated');
create policy "Admin delete" on awards for delete using (auth.role() = 'authenticated');

-- media_kit_buttons
create policy "Admin write" on media_kit_buttons for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on media_kit_buttons for update using (auth.role() = 'authenticated');
create policy "Admin delete" on media_kit_buttons for delete using (auth.role() = 'authenticated');

-- bts_images
create policy "Admin write" on bts_images for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on bts_images for update using (auth.role() = 'authenticated');
create policy "Admin delete" on bts_images for delete using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKETS (create manually in Supabase Dashboard)
-- ============================================================
--
-- Bucket: images
--   - Public: Yes
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp, image/avif
--
-- Bucket: videos
--   - Public: Yes
--   - File size limit: 100MB
--   - Allowed MIME types: video/mp4, video/webm, video/quicktime
--
-- Bucket: hero
--   - Public: Yes
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- Storage policies (apply to all buckets):
--   SELECT: allow public (anon) read
--   INSERT: allow authenticated only
--   UPDATE: allow authenticated only
--   DELETE: allow authenticated only
