# Quick Fix Guide for Login Issues

## Problem: "Invalid credentials" error

### Step 1: Generate Proper JWT Secret
\`\`\`bash
# Run this command to generate a secure JWT secret
node scripts/generate-jwt-secret.js
\`\`\`

### Step 2: Find Out Your Password
The hash in your .env.local corresponds to password: **"admin123"**

Try logging in with:
- Email: `admin@mimosuterinos.com`
- Password: `admin123`

### Step 3: Test Your Environment
Visit: http://localhost:3000/api/auth/test

This will show you:
- If your environment variables are loaded correctly
- Which password works with your hash

### Step 4: Generate New Password (Optional)
\`\`\`bash
# Generate hash for a custom password
node scripts/generate-admin-password.js "your-new-password"
\`\`\`

### Step 5: Update .env.local
Replace your JWT_SECRET with the generated one:
\`\`\`env
JWT_SECRET=your-generated-secret-here
\`\`\`

## Important Notes:

1. **Admin credentials are NOT stored in the database** - they're hardcoded in environment variables
2. **Empty database is normal** - user data will be created when users register through the Flutter app
3. **The admin login is separate** from regular user accounts

## Test Login Steps:
1. Restart your development server: `npm run dev`
2. Go to http://localhost:3000
3. Use: admin@mimosuterinos.com / admin123
4. If it still fails, check the console logs in your terminal
