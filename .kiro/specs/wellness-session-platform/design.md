# Design Document

## Overview

The Secure Wellness Session Platform is a Next.js 15 full-stack application built with TypeScript, MongoDB, and modern React patterns. The platform leverages the existing authentication infrastructure and extends it with comprehensive session management, real-time auto-save functionality, and a responsive user interface using Tailwind CSS and react-hot-toast for notifications.

The application follows a modular architecture with clear separation between frontend components, API routes, database models, and utility functions. The existing JWT-based authentication system provides secure user management, while the MongoDB database with Mongoose ODM handles data persistence.

## Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4 with custom components
- **State Management**: React hooks and context for local state
- **Notifications**: react-hot-toast for user feedback
- **Auto-save**: Custom hook with debounced API calls

### Backend Architecture
- **API Routes**: Next.js API routes with RESTful design
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Database**: MongoDB with Mongoose ODM
- **Middleware**: Custom authentication middleware for route protection

### Security Architecture
- **Authentication**: JWT tokens with 1-hour expiration
- **Authorization**: Route-level protection via middleware
- **Data Validation**: Client and server-side validation
- **CSRF Protection**: HTTP-only cookies for token storage

## Components and Interfaces

### Core Components

#### Authentication Components
```typescript
// components/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess: () => void;
}

// components/auth/RegisterForm.tsx  
interface RegisterFormProps {
  onSuccess: () => void;
}

// components/auth/AuthLayout.tsx
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}
```

#### Session Management Components
```typescript
// components/sessions/SessionCard.tsx
interface SessionCardProps {
  session: SessionWithUser;
  onEdit?: (sessionId: string) => void;
  showAuthor?: boolean;
}

// components/sessions/SessionList.tsx
interface SessionListProps {
  sessions: SessionWithUser[];
  emptyMessage: string;
  showAuthor?: boolean;
}

// components/sessions/SessionEditor.tsx
interface SessionEditorProps {
  sessionId?: string;
  initialData?: Partial<SessionData>;
  onSave: (data: SessionData) => void;
  onPublish: (data: SessionData) => void;
}
```

#### Layout Components
```typescript
// components/layout/Navigation.tsx
interface NavigationProps {
  currentUser: User;
  onLogout: () => void;
}

// components/layout/PageLayout.tsx
interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  showNavigation?: boolean;
}
```

#### UI Components
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// components/ui/Input.tsx
interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

// components/ui/AutoSaveIndicator.tsx
interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
}
```

### Custom Hooks

#### Auto-save Hook
```typescript
// hooks/useAutoSave.ts
interface UseAutoSaveOptions {
  delay: number;
  onSave: (data: any) => Promise<void>;
  enabled: boolean;
}

interface UseAutoSaveReturn {
  save: (data: any) => void;
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
}
```

#### Session Management Hook
```typescript
// hooks/useSession.ts
interface UseSessionReturn {
  session: SessionData | null;
  loading: boolean;
  error: string | null;
  updateSession: (data: Partial<SessionData>) => void;
  saveSession: () => Promise<void>;
  publishSession: () => Promise<void>;
}
```

### API Interfaces

#### Authentication APIs
```typescript
// API: POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user: User;
  message?: string;
}

// API: POST /api/auth/register
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  user: User;
  message?: string;
}

// API: POST /api/auth/logout
interface LogoutResponse {
  success: boolean;
  message: string;
}
```

#### Session APIs
```typescript
// API: GET /api/sessions
interface GetSessionsResponse {
  success: boolean;
  sessions: SessionWithUser[];
}

// API: GET /api/my-sessions
interface GetMySessionsResponse {
  success: boolean;
  sessions: Session[];
}

// API: POST /api/sessions
interface CreateSessionRequest {
  title: string;
  tags: string[];
  json_file_url: string;
  status: 'draft' | 'published';
}

// API: PUT /api/sessions/[id]
interface UpdateSessionRequest {
  title?: string;
  tags?: string[];
  json_file_url?: string;
  status?: 'draft' | 'published';
}

// API: POST /api/sessions/[id]/auto-save
interface AutoSaveRequest {
  title: string;
  tags: string[];
  json_file_url: string;
}
```

## Data Models

### Enhanced User Model
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  password: string; // hashed
  createdAt: Date;
}

interface UserPublic {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
}
```

### Enhanced Session Model
```typescript
interface Session {
  _id: string;
  userId: string;
  title: string;
  tags: string[];
  json_file_url: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

interface SessionWithUser extends Session {
  user: UserPublic;
}

interface SessionData {
  title: string;
  tags: string[];
  json_file_url: string;
}
```

### Form Validation Schemas
```typescript
interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SessionFormData {
  title: string;
  tags: string;
  json_file_url: string;
}
```

## Error Handling

### Client-Side Error Handling
- **Form Validation**: Real-time validation with error display
- **API Errors**: Toast notifications for user feedback
- **Network Errors**: Retry mechanisms and offline indicators
- **Auto-save Errors**: Visual indicators and manual retry options

### Server-Side Error Handling
- **Authentication Errors**: Proper HTTP status codes and messages
- **Validation Errors**: Detailed field-level error responses
- **Database Errors**: Graceful error handling with logging
- **Rate Limiting**: Protection against abuse with proper error messages

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
  code?: string;
}
```

## Testing Strategy

### Unit Testing
- **Components**: Test rendering, props, and user interactions
- **Hooks**: Test custom hooks with various scenarios
- **Utilities**: Test helper functions and validation logic
- **API Routes**: Test request/response handling and error cases

### Integration Testing
- **Authentication Flow**: Test login, registration, and logout
- **Session Management**: Test CRUD operations and auto-save
- **Route Protection**: Test middleware and authentication guards
- **Database Operations**: Test model interactions and data integrity

### End-to-End Testing
- **User Journeys**: Test complete user workflows
- **Cross-browser**: Ensure compatibility across browsers
- **Responsive Design**: Test on various screen sizes
- **Performance**: Test loading times and responsiveness

### Testing Tools
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **MSW**: API mocking for tests

## Performance Considerations

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: Next.js Image component for assets
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching**: Browser caching for static assets

### Backend Optimizations
- **Database Indexing**: Proper indexes on frequently queried fields
- **Connection Pooling**: Efficient database connection management
- **API Caching**: Response caching for read-heavy operations
- **Pagination**: Implement pagination for large data sets

### Auto-save Optimizations
- **Debouncing**: 5-second delay to prevent excessive API calls
- **Diff Detection**: Only save when content actually changes
- **Background Saving**: Non-blocking save operations
- **Conflict Resolution**: Handle concurrent edit scenarios

## Security Measures

### Authentication Security
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Security**: Short expiration times and secure signing
- **Cookie Security**: HTTP-only, secure, and SameSite attributes
- **Session Management**: Proper token invalidation on logout

### Data Security
- **Input Validation**: Comprehensive client and server validation
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Prevention**: Proper data sanitization and encoding
- **CSRF Protection**: Token-based request validation

### API Security
- **Rate Limiting**: Prevent abuse and DoS attacks
- **CORS Configuration**: Proper cross-origin request handling
- **Error Information**: Avoid exposing sensitive system details
- **Logging**: Comprehensive security event logging

## Deployment Architecture

### Environment Configuration
- **Development**: Local MongoDB and development settings
- **Staging**: Staging database and testing configurations
- **Production**: Production database with security hardening

### Environment Variables
```
MONGO_URI=mongodb://localhost:27017/wellness-platform
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Build and Deployment
- **Build Process**: Next.js production build with optimizations
- **Static Assets**: CDN deployment for images and static files
- **Database Migration**: Automated schema updates and data migration
- **Health Checks**: Application and database health monitoring