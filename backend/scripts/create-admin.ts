import bcrypt from 'bcryptjs'
import pg from 'pg'
import readline from 'readline'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function main() {
  const email = await ask('Admin email: ')
  const password = await ask('Admin password: ')

  if (!email || !password) {
    console.error('Email and password are required')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters')
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 12)

  const { rows } = await pool.query(
    'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password_hash = $2 RETURNING id, email',
    [email, hash]
  )

  console.log(`Admin created: ${rows[0].email} (${rows[0].id})`)
  await pool.end()
  rl.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
