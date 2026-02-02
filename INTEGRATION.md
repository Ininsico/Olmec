# Frontend-Backend Integration

This document describes how the frontend connects to the backend API.

## Environment Configuration

The frontend uses environment variables to configure the API endpoint. Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update this to your production API URL.

## API Service

The API service is located at `src/lib/api.ts` and provides:

### Authentication API
- `authAPI.login(email, password)` - Login with email and password
- `authAPI.register(name, email, password)` - Register a new user
- `authAPI.googleAuth()` - Redirect to Google OAuth
- `authAPI.githubAuth()` - Redirect to GitHub OAuth

### User API
- `userAPI.getMe()` - Get current user data
- `userAPI.getCurrentUserProfile()` - Get current user's full profile
- `userAPI.checkProfile()` - Check if profile is complete
- `userAPI.completeProfile(data)` - Complete user profile
- `userAPI.uploadPhoto(file)` - Upload profile photo
- `userAPI.getUserProfile(username)` - Get another user's profile

### Model API
- `modelAPI.uploadModel(data)` - Upload a 3D model
- `modelAPI.getUserModels(username)` - Get user's models

## Authentication Context

The `AuthContext` (`src/contexts/AuthContext.tsx`) manages the global authentication state:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, refreshUser } = useAuth();
  
  // user: Current user object or null
  // isAuthenticated: Boolean indicating if user is logged in
  // login(token): Function to log in with a token
  // logout(): Function to log out
  // refreshUser(): Function to refresh user data from API
}
```

## Protected Routes

To create protected routes that require authentication:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
}
```

## OAuth Flow

1. User clicks "Sign in with Google/GitHub"
2. Frontend redirects to backend OAuth endpoint
3. Backend handles OAuth with provider
4. Backend redirects to `/auth-success?token=JWT_TOKEN`
5. Frontend extracts token and stores in localStorage
6. User is redirected to home page

## Token Management

- Tokens are stored in `localStorage` with key `'token'`
- Axios interceptor automatically adds token to all requests
- If a 401 response is received, user is logged out and redirected to login

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`

Update `backend/server.js` to add production URLs when deploying.

## Testing the Integration

1. Start the backend: `cd backend && node server.js`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:5173`
4. Try signing up or logging in
5. Check the browser console and network tab for any errors

## Common Issues

### CORS Errors
- Ensure backend is running on port 5000
- Check that CORS origins in `backend/server.js` match your frontend URL

### 401 Unauthorized
- Token may be expired or invalid
- Check that the token is being sent in the Authorization header
- Verify the JWT secret matches between frontend and backend

### Network Errors
- Ensure backend is running
- Check the API URL in `.env` file
- Verify firewall settings aren't blocking requests
