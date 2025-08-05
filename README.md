# Wellness Session Management

A modern web application for creating, managing, and sharing wellness sessions including yoga, meditation, and other wellness activities. Built with Next.js, TypeScript, and MongoDB.

## Features

- **User Authentication**: Secure registration and login system with JWT tokens
- **Session Management**: Create, edit, and publish wellness sessions
- **Community Sharing**: Browse and discover sessions created by other users
- **Draft System**: Save sessions as drafts before publishing
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Updates**: Auto-save functionality for session editing

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: JWT tokens with bcryptjs for password hashing
- **UI Components**: Custom component library with Tailwind CSS
- **State Management**: React hooks with custom hooks for data fetching

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or cloud)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JeetDas5/wellness-seasion-management
cd wellness-session-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── sessions/          # Session management pages
│   └── my-sessions/       # User's personal sessions
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   ├── sessions/         # Session-related components
│   └── ui/               # Base UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── models/               # MongoDB/Mongoose models
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## Key Features

### Authentication System
- Secure user registration and login
- JWT-based session management
- Password hashing with bcryptjs
- Protected routes with middleware

### Session Management
- Create and edit wellness sessions
- Draft and publish workflow
- Tag-based categorization
- JSON file storage for session data

### User Experience
- Responsive design for all devices
- Loading states and error handling
- Auto-save functionality
- Toast notifications for user feedback

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/sessions` - Fetch published sessions
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/[id]` - Update session
- `DELETE /api/sessions/[id]` - Delete session

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support and questions, please contact the development team.
