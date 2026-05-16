// scripts/create-admin.js
// شغّله مرة واحدة عشان تعمل حساب المدير
// node scripts/create-admin.js

const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createAdmin() {
  // ✏️ غيّر البيانات دي
  const ADMIN_EMAIL = 'admin@yourcompany.de'
  const ADMIN_PASSWORD = 'Admin@123456'
  const ADMIN_NAME = 'مدير النظام'

  console.log('📝 Creating admin account...')

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: ADMIN_EMAIL,
      password_hash: hash,
      full_name: ADMIN_NAME,
      role: 'admin',
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      console.log('⚠️  Admin already exists!')
    } else {
      console.error('❌ Error:', error.message)
    }
    return
  }

  console.log('✅ Admin created successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📧 Email:    ${ADMIN_EMAIL}`)
  console.log(`🔐 Password: ${ADMIN_PASSWORD}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  غيّر كلمة المرور بعد أول تسجيل دخول!')
}

createAdmin().catch(console.error)
