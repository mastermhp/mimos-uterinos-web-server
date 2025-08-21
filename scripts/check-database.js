const { connectToDatabase } = require('../lib/mongodb')

async function checkDatabase() {
  try {
    console.log('🔄 Connecting to database...')
    const { db } = await connectToDatabase()
    console.log('✅ Database connection successful!')
    
    // Check collections
    const collections = await db.listCollections().toArray()
    console.log('\n📁 Available collections:')
    collections.forEach(col => {
      console.log(`  - ${col.name}`)
    })
    
    // Check users collection
    console.log('\n👥 Users collection:')
    const userCount = await db.collection('users').countDocuments()
    console.log(`  Total users: ${userCount}`)
    
    if (userCount > 0) {
      const users = await db.collection('users').find({}, { 
        projection: { name: 1, email: 1, accountType: 1, status: 1, createdAt: 1 } 
      }).toArray()
      
      console.log('\n  Users:')
      users.forEach(user => {
        console.log(`    - ${user.name} (${user.email}) - ${user.accountType || 'user'} - ${user.status || 'active'}`)
      })
    }
    
    // Check other collections
    const collectionNames = ['cycles', 'symptoms', 'ai_chats', 'consultations', 'reports']
    
    for (const collectionName of collectionNames) {
      const count = await db.collection(collectionName).countDocuments()
      console.log(`\n📊 ${collectionName}: ${count} documents`)
    }
    
    console.log('\n✅ Database check completed!')
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  checkDatabase().then(() => {
    process.exit(0)
  })
}

module.exports = checkDatabase
