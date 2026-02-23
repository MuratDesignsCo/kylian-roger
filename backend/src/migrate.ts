import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function runMigrations(): Promise<void> {
  // 1. Créer la table de suivi si elle n'existe pas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  // 2. Lire les migrations déjà appliquées
  const { rows: applied } = await pool.query(
    'SELECT filename FROM schema_migrations ORDER BY filename'
  )
  const appliedSet = new Set(applied.map((r: { filename: string }) => r.filename))

  // 3. Trouver les fichiers de migration sur disque
  const migrationsDir = path.resolve(__dirname, '..', 'migrations')

  if (!fs.existsSync(migrationsDir)) {
    console.log('[migrate] Aucun dossier migrations/ trouvé, skip.')
    return
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  // 4. Appliquer les nouvelles migrations dans l'ordre
  for (const file of files) {
    if (appliedSet.has(file)) continue

    console.log(`[migrate] Application de ${file}...`)
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      )
      await client.query('COMMIT')
      console.log(`[migrate] ${file} appliqué avec succès`)
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`[migrate] Échec de ${file}:`, err)
      throw err
    } finally {
      client.release()
    }
  }

  console.log('[migrate] Migrations à jour.')
}
