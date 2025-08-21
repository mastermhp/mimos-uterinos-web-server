# Mimos Uterinos CMS & API Setup Guide

This comprehensive guide will walk you through setting up the complete Mimos Uterinos CMS and API system.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Gemini AI API key from Google AI Studio
- Git installed
- Code editor (VS Code recommended)

## Step 1: Project Setup

### 1.1 Clone or Create Project
\`\`\`bash
# Create new Next.js project
npx create-next-app@latest mimos-uterinos-cms --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Navigate to project directory
cd mimos-uterinos-cms
\`\`\`

### 1.2 Install Dependencies
\`\`\`bash
npm install mongodb bcryptjs jsonwebtoken recharts @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-button @radix-ui/react-card @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-input @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-sheet @radix-ui/react-skeleton @radix-ui/react-tabs @radix-ui/react-toast lucide-react class-variance-authority clsx tailwind-merge
\`\`\`

## Step 2: Database Setup

### 2.1 MongoDB Installation (Local)
\`\`\`bash
# On macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Or use MongoDB Atlas (cloud) - recommended for production
\`\`\`

### 2.2 MongoDB Atlas Setup (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster
4. Get connection string
5. Whitelist your IP address
6. Create database user

### 2.3 Database Collections
The system will automatically create these collections:
- `users` - User accounts and profiles
- `cycles` - Menstrual cycle data
- `symptoms` - Symptom tracking
- `conversations` - AI chat history
- `symptom_analyses` - AI symptom analysis
- `daily_insights` - AI-generated insights

## Step 3: Environment Configuration

### 3.1 Create Environment File
\`\`\`bash
# Create .env.local file in project root
touch .env.local
\`\`\`

### 3.2 Add Environment Variables
\`\`\`env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=mimosuterinos

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key-here

# Admin Credentials
ADMIN_EMAIL=admin@mimosuterinos.com
# Generate password hash: node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
ADMIN_PASSWORD_HASH=$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

# Optional: Email Configuration (for future features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
\`\`\`

## Step 4: Get Gemini API Key

### 4.1 Google AI Studio Setup
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with Google account
3. Click "Get API Key"
4. Create new API key
5. Copy the key to your `.env.local` file

### 4.2 Test API Key
\`\`\`bash
# Test your API key
curl -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY"
\`\`\`

## Step 5: Generate Admin Password Hash

### 5.1 Create Password Hash
\`\`\`bash
# Run this command to generate password hash
node -e "console.log(require('bcryptjs').hashSync('your-admin-password', 10))"

# Copy the output to ADMIN_PASSWORD_HASH in .env.local
\`\`\`

## Step 6: Run Development Server

### 6.1 Start the Application
\`\`\`bash
# Install dependencies (if not done)
npm install

# Run development server
npm run dev
\`\`\`

### 6.2 Access the Application
- Admin Panel: http://localhost:3000
- Login with your admin credentials

## Step 7: Test API Endpoints

### 7.1 Test Admin Login
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mimosuterinos.com","password":"your-password"}'
\`\`\`

### 7.2 Test User Registration
\`\`\`bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpassword"}'
\`\`\`

### 7.3 Test User Login
\`\`\`bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'
\`\`\`

## Step 8: Production Deployment

### 8.1 Vercel Deployment
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
\`\`\`

### 8.2 Environment Variables in Vercel
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all variables from `.env.local`

### 8.3 MongoDB Atlas for Production
1. Update `MONGODB_URI` to Atlas connection string
2. Ensure IP whitelist includes `0.0.0.0/0` for Vercel
3. Use strong database credentials

## Step 9: Flutter App Integration

### 9.1 Update Flutter API Base URL
\`\`\`dart
// In your Flutter app, update the base URL
class ApiService {
  static const String baseUrl = 'https://your-vercel-app.vercel.app/api';
  // For local development: 'http://localhost:3000/api'
}
\`\`\`

### 9.2 Update Authentication
\`\`\`dart
// Replace local storage with API calls
Future<bool> login(String email, String password) async {
  final response = await http.post(
    Uri.parse('$baseUrl/users/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email, 'password': password}),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    await SecureStorage.store('auth_token', data['token']);
    return true;
  }
  return false;
}
\`\`\`

### 9.3 Update Data Sync
\`\`\`dart
// Sync cycle data
Future<void> syncCycleData(Map<String, dynamic> cycleData) async {
  final token = await SecureStorage.get('auth_token');
  final response = await http.post(
    Uri.parse('$baseUrl/cycles'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode(cycleData),
  );
}
\`\`\`

## Step 10: Testing & Verification

### 10.1 Test Checklist
- [ ] Admin login works
- [ ] User registration works
- [ ] User login works
- [ ] Cycle data can be stored/retrieved
- [ ] Symptoms can be logged
- [ ] AI chat responds correctly
- [ ] Analytics display data
- [ ] Database connections stable

### 10.2 Load Testing
\`\`\`bash
# Install artillery for load testing
npm install -g artillery

# Create test script (artillery-test.yml)
# Run load test
artillery run artillery-test.yml
\`\`\`

## Step 11: Security Considerations

### 11.1 Security Checklist
- [ ] Strong JWT secret (32+ characters)
- [ ] HTTPS in production
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Password hashing with bcrypt
- [ ] Environment variables secured
- [ ] Database access restricted

### 11.2 Additional Security
\`\`\`javascript
// Add rate limiting middleware
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
\`\`\`

## Step 12: Monitoring & Maintenance

### 12.1 Logging Setup
\`\`\`javascript
// Add logging middleware
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
\`\`\`

### 12.2 Health Checks
\`\`\`javascript
// Add health check endpoint
export async function GET() {
  try {
    await connectDB()
    return NextResponse.json({ status: 'healthy', timestamp: new Date() })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 500 })
  }
}
\`\`\`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string
   - Verify network access
   - Check credentials

2. **Gemini API Not Working**
   - Verify API key
   - Check quota limits
   - Ensure proper request format

3. **JWT Token Issues**
   - Check JWT secret length
   - Verify token expiration
   - Check authorization headers

4. **CORS Issues**
   - Configure Next.js API routes
   - Check request origins
   - Verify headers

### Getting Help

- Check MongoDB Atlas documentation
- Review Gemini AI documentation
- Check Next.js API routes guide
- Review Vercel deployment docs

## Next Steps

1. **Add Email Notifications**
   - Implement email verification
   - Add password reset
   - Send cycle reminders

2. **Enhanced Analytics**
   - Add more chart types
   - Implement real-time updates
   - Add export functionality

3. **Mobile App Features**
   - Push notifications
   - Offline sync
   - Background data sync

4. **AI Improvements**
   - Fine-tune prompts
   - Add more AI features
   - Implement feedback system

This completes the setup guide for your Mimos Uterinos CMS and API system!
