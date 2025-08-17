# Mimos Uterinos - CMS & API System

A comprehensive Content Management System and API for the Mimos Uterinos menstrual health tracking application.

## Features

### Admin Panel
- **Dashboard** with real-time statistics and analytics
- **User Management** with detailed profiles and activity tracking
- **Analytics** with interactive charts and data visualization
- **Secure Authentication** with JWT tokens

### API System
- **User Authentication** (registration, login, profile management)
- **Cycle Tracking** (menstrual cycle logging and retrieval)
- **Symptom Management** (symptom tracking with AI analysis)
- **AI Integration** (chat assistant, insights, symptom analysis)
- **Admin APIs** (user management, analytics, statistics)

### AI Features
- **Symptom Analysis** using Gemini AI
- **Chat Assistant** for personalized health advice
- **Daily Insights** generation based on cycle data
- **Personalized Recommendations** for each user

## Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with native driver
- **Authentication**: JWT tokens with bcrypt password hashing
- **AI**: Google Gemini AI API
- **UI Components**: Radix UI primitives
- **Charts**: Recharts for data visualization

## Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd mimos-uterinos-cms
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   \`\`\`

4. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access the application**
   - Admin Panel: http://localhost:3000
   - API Documentation: See SETUP_GUIDE.md

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `MONGODB_DB` | Database name | Yes |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `ADMIN_EMAIL` | Admin login email | Yes |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | Yes |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Cycle Tracking
- `GET /api/cycles` - Get user cycles
- `POST /api/cycles` - Log new cycle

### Symptom Tracking
- `GET /api/symptoms` - Get user symptoms
- `POST /api/symptoms` - Log new symptom

### AI Features
- `POST /api/ai/analyze-symptoms` - Analyze symptoms with AI
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/insights` - Get daily insights

### Admin APIs
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get analytics data

## Database Schema

### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  salt: String,
  age: Number,
  height: Number,
  weight: Number,
  cycleLength: Number (default: 28),
  periodLength: Number (default: 5),
  lastPeriodDate: Date,
  isVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  isPremium: Boolean (default: false),
  verificationToken: String,
  resetToken: String,
  createdAt: Date,
  updatedAt: Date,
  lastActive: Date
}
\`\`\`

### Cycles Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: String,
  startDate: Date,
  endDate: Date,
  length: Number,
  flow: String, // light, medium, heavy
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Symptoms Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: String,
  date: Date,
  symptom: String,
  severity: Number (1-10),
  notes: String,
  createdAt: Date
}
\`\`\`

### Conversations Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: String,
  messages: [{
    userMessage: String,
    aiResponse: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`
4. Set environment variables in Vercel dashboard

### MongoDB Atlas Setup
1. Create MongoDB Atlas account
2. Create cluster and database
3. Get connection string
4. Update `MONGODB_URI` in environment variables

## Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Cross-origin request handling
- **Environment Variables**: Sensitive data protection

## Development

### Project Structure
\`\`\`
├── app/
│   ├── api/                 # API routes
│   ├── dashboard/           # Admin panel pages
│   ├── globals.css          # Global styles
│   ├── layout.jsx           # Root layout
│   └── page.jsx             # Login page
├── components/              # Reusable components
├── lib/                     # Utility functions
├── public/                  # Static assets
└── README.md
\`\`\`

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## Support

For support and questions:
- Check the SETUP_GUIDE.md for detailed instructions
- Review API documentation
- Check MongoDB and Gemini AI documentation
- Create an issue in the repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### v1.0.0
- Initial release
- Admin panel with dashboard, user management, and analytics
- Complete API system for Flutter app integration
- AI features with Gemini integration
- MongoDB database integration
- JWT authentication system
# mimos-uterinos-v2-server
# mimos-uterinos-web-server
