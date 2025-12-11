# Tech Stack

## Frontend Technologies

### Core Framework
- **Next.js 15.2.2**
  - React-based framework for production-grade applications
  - App Router architecture for modern routing
  - Server-side rendering (SSR) and static site generation (SSG)
  - Turbopack for faster development builds
  - Built-in API routes for backend functionality

### UI Framework & Styling
- **React 19.0.0**
  - Latest version with improved performance and features
  - Component-based architecture
  - Hooks for state management and side effects

- **Tailwind CSS 4.0**
  - Utility-first CSS framework
  - Custom design system with modern aesthetics
  - Responsive design utilities
  - PostCSS integration via `@tailwindcss/postcss`

### UI Components & Icons
- **Lucide React (v0.479.0)**
  - Modern, customizable icon library
  - Tree-shakeable for optimal bundle size
  - Used for: ChevronDown, BarChart2, Globe, Layers, Share2, Menu, X, QrCode, ExternalLink, etc.

### Data Visualization
- **Recharts (v2.15.1)**
  - React-based charting library
  - Used for analytics dashboards
  - Interactive and responsive charts

- **React Chart.js 2 (v5.3.0)**
  - React wrapper for Chart.js
  - Alternative charting solution
  - Flexible chart configurations

### QR Code Generation
- **qrcode.react (v4.2.0)**
  - QR code generation component
  - Supports SVG and Canvas rendering
  - Customizable size and error correction levels

## Backend Technologies

### Runtime & Language
- **Node.js (v20+)**
  - JavaScript runtime environment
  - Asynchronous, event-driven architecture

- **TypeScript (v5)**
  - Static type checking
  - Enhanced IDE support
  - Improved code quality and maintainability

### Database
- **MongoDB**
  - NoSQL document database
  - Flexible schema design
  - Scalable and high-performance

- **Mongoose (v8.12.1)**
  - MongoDB ODM (Object Data Modeling)
  - Schema validation
  - Middleware support
  - Type-safe queries with TypeScript

### Authentication & Security
- **JWT (JSON Web Tokens)**
  - **jose (v6.0.10)**: Modern JWT library for Next.js Edge runtime
  - **jsonwebtoken (v9.0.2)**: Traditional JWT implementation
  - Stateless authentication
  - Secure token-based auth

- **bcryptjs (v3.0.2)** & **bcrypt (v5.1.1)**
  - Password hashing
  - Salt generation
  - Secure password storage

- **crypto (Node.js built-in)**
  - Password reset token generation
  - Cryptographic operations

### API & HTTP
- **Axios (v1.8.3)**
  - Promise-based HTTP client
  - Request/response interceptors
  - Automatic JSON transformation

### Third-Party Services
- **IPInfo API**
  - Geolocation services
  - IP address lookup
  - Geographic data (country, city, coordinates)
  - ISP and organization information
  - SDK: `ip-geolocation-api-sdk-typescript (v1.0.7)`

- **Google Auth Library (v9.15.1)**
  - Google OAuth integration
  - Token verification
  - User authentication via Google

### Utilities
- **nanoid (v5.1.3)**
  - Unique ID generation
  - URL-safe random string generator
  - Used for short URL IDs

- **ua-parser-js (v2.0.2)**
  - User agent parsing
  - Device, browser, and OS detection
  - Analytics tracking

- **cookie (v1.0.2)**
  - Cookie parsing and serialization
  - HTTP cookie management

- **dotenv (v16.4.7)**
  - Environment variable management
  - Configuration management

- **zod (v3.24.2)**
  - TypeScript-first schema validation
  - Runtime type checking
  - API request validation

## Development Tools

### Code Quality
- **ESLint (v9)**
  - Code linting
  - Style enforcement
  - Best practices checking
  - Next.js specific rules via `eslint-config-next`

- **TypeScript ESLint**
  - TypeScript-specific linting rules
  - Type-aware linting

### Build Tools
- **Turbopack**
  - Next-generation bundler
  - Faster than Webpack
  - Incremental compilation

- **PostCSS**
  - CSS transformation
  - Tailwind CSS processing
  - Autoprefixer support

## Type Definitions
- `@types/node` - Node.js type definitions
- `@types/react` - React type definitions
- `@types/react-dom` - React DOM type definitions
- `@types/jsonwebtoken` - JWT type definitions

## Font Integration
- **Google Fonts**
  - Righteous font family
  - Poppins font family
  - Optimized loading via `next/font`

## Architecture Patterns

### Design Patterns
- **MVC (Model-View-Controller)**
  - Models: Mongoose schemas in `/app/models`
  - Views: React components
  - Controllers: API routes in `/app/api`

- **Repository Pattern**
  - Database abstraction
  - Centralized data access

- **Middleware Pattern**
  - Authentication middleware
  - Request/response processing

### State Management
- **React Context API**
  - Global state management
  - Authentication context
  - User session management

- **Local Storage**
  - Client-side data persistence
  - Guest user URL storage
  - Auto-sync on login

### API Architecture
- **RESTful API**
  - Resource-based endpoints
  - Standard HTTP methods
  - JSON request/response format

## Deployment & Hosting

### Recommended Platforms
- **Vercel** (Optimized for Next.js)
  - Automatic deployments
  - Edge network
  - Serverless functions

- **MongoDB Atlas**
  - Cloud-hosted MongoDB
  - Automatic backups
  - Scalable clusters

## Performance Optimizations

### Frontend
- **Code Splitting**: Automatic via Next.js
- **Image Optimization**: Next.js Image component
- **Font Optimization**: next/font for automatic font optimization
- **Tree Shaking**: Unused code elimination
- **Lazy Loading**: Dynamic imports for components

### Backend
- **Database Indexing**: MongoDB indexes on frequently queried fields
- **Connection Pooling**: Mongoose connection caching
- **TTL Indexes**: Automatic document expiration
- **Caching**: Global mongoose connection cache

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Next.js built-in CORS handling
- **Environment Variables**: Sensitive data protection
- **Input Validation**: Zod schema validation
- **XSS Protection**: React's built-in XSS prevention
- **CSRF Protection**: Token-based protection

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2017+ JavaScript features
- Progressive Web App capabilities
- Mobile-responsive design

## Development Environment

- **Package Manager**: npm/yarn/pnpm
- **Node Version**: v20+
- **TypeScript**: Strict mode enabled
- **Module System**: ESNext with bundler resolution
