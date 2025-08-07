const bcrypt = require('bcryptjs')
const { connectToDatabase } = require('../lib/mongodb')

async function seedAdmin() {
  try {
    console.log('🔄 Connecting to database...')
    const { db } = await connectToDatabase()
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@mimosuterinos.com' 
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      console.log('📧 Email:', existingAdmin.email)
      console.log('🆔 ID:', existingAdmin._id.toString())
      return
    }
    
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mimosuterinos.com'
    const adminPassword = 'admin123' // Default password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    const adminUser = {
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      accountType: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      requirePasswordChange: false
    }
    
    const result = await db.collection('users').insertOne(adminUser)
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('🆔 ID:', result.insertedId.toString())
    console.log('')
    console.log('🚀 You can now login with these credentials')
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin().then(() => {
    console.log('✅ Seeding completed')
    process.exit(0)
  })
}

module.exports = seedAdmin
