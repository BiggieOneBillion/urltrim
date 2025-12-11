# Design Decisions

This document outlines the key architectural and technical decisions made during the development of URLTRIM, along with the rationale behind each choice.

## 1. Framework Selection: Next.js 15

### Decision
Use Next.js 15 with App Router as the primary framework.

### Rationale
- **Full-Stack Capability**: Combines frontend and backend in a single framework
- **API Routes**: Built-in API route handling eliminates need for separate backend
- **Server Components**: Improved performance with React Server Components
- **File-Based Routing**: Intuitive routing system based on file structure
- **SEO Optimization**: Built-in SSR and SSG for better search engine visibility
- **Developer Experience**: Hot module replacement, TypeScript support, and excellent tooling
- **Turbopack**: Next-generation bundler for faster development builds
- **Production Ready**: Battle-tested framework used by major companies

### Alternatives Considered
- **Separate React + Express**: More complex setup, harder to maintain
- **Remix**: Less mature ecosystem at the time of development
- **SvelteKit**: Smaller community and fewer resources

## 2. Database: MongoDB with Mongoose

### Decision
Use MongoDB as the primary database with Mongoose ODM.

### Rationale
- **Schema Flexibility**: NoSQL structure allows for evolving data models
- **Document Model**: Natural fit for URL and analytics data
- **Scalability**: Horizontal scaling capabilities for future growth
- **TTL Indexes**: Built-in support for automatic document expiration (perfect for URL expiration)
- **Mongoose Benefits**:
  - Schema validation
  - Middleware hooks (pre-save for password hashing)
  - Type safety with TypeScript
  - Query builder with intuitive API

### Alternatives Considered
- **PostgreSQL**: More rigid schema, less suitable for analytics data
- **Redis**: Considered for caching layer, not primary database
- **Firebase**: Vendor lock-in concerns, less control

## 3. Authentication: JWT with HTTP-Only Cookies

### Decision
Implement JWT-based authentication with tokens stored in HTTP-only cookies.

### Rationale
- **Stateless**: No server-side session storage required
- **Scalability**: Easy to scale horizontally without session synchronization
- **Security**: HTTP-only cookies prevent XSS attacks
- **Performance**: No database lookup for every request
- **Flexibility**: Easy to add additional claims to token payload
- **jose Library**: Modern JWT library compatible with Next.js Edge runtime

### Security Considerations
- Tokens expire after set duration
- Refresh token rotation (future enhancement)
- Secure cookie flags in production
- Token validation on every protected request

### Alternatives Considered
- **Session-Based Auth**: Requires session store, harder to scale
- **OAuth Only**: Wanted to support email/password auth
- **Local Storage**: Vulnerable to XSS attacks

## 4. URL ID Generation: nanoid

### Decision
Use nanoid for generating unique short URL identifiers.

### Rationale
- **URL-Safe**: Generates URL-safe random strings
- **Collision Resistance**: Cryptographically strong random generator
- **Compact**: Shorter IDs than UUID (default 21 characters)
- **Performance**: Faster than UUID generation
- **Customizable**: Can adjust length and alphabet
- **No Dependencies**: Lightweight library

### Configuration
```typescript
// Default: 21 characters, URL-safe alphabet
const shortId = nanoid();
```

### Alternatives Considered
- **UUID**: Longer, less user-friendly
- **Sequential IDs**: Predictable, security concerns
- **Custom Base62**: More complex implementation

## 5. Styling: Tailwind CSS 4

### Decision
Use Tailwind CSS as the primary styling solution.

### Rationale
- **Utility-First**: Rapid UI development
- **Consistency**: Design system built into utility classes
- **Performance**: Purges unused CSS in production
- **Responsive**: Mobile-first responsive design utilities
- **Customization**: Easy to extend with custom utilities
- **Developer Experience**: IntelliSense support, no context switching
- **Modern Features**: Tailwind 4 with PostCSS integration

### Design System
- Black and white color scheme for modern aesthetic
- Custom fonts (Righteous, Poppins) via Google Fonts
- Responsive breakpoints for mobile, tablet, desktop

### Alternatives Considered
- **CSS Modules**: More boilerplate, less consistent
- **Styled Components**: Runtime overhead, larger bundle
- **Vanilla CSS**: Harder to maintain, no utility classes

## 6. Geolocation: IPInfo API

### Decision
Use IPInfo API for IP-based geolocation.

### Rationale
- **Accuracy**: High-quality geolocation data
- **Comprehensive Data**: Country, city, coordinates, ISP, organization
- **Reliability**: 99.9% uptime SLA
- **Free Tier**: Generous free tier for development
- **Simple API**: Easy integration with single endpoint
- **TypeScript SDK**: Official SDK with type definitions

### Data Collected
- Geographic: country, city, latitude, longitude
- Network: ISP, organization
- Administrative: state, district, zipcode

### Alternatives Considered
- **MaxMind GeoIP2**: More complex setup, requires database
- **IP-API**: Rate limiting concerns
- **ipgeolocation.io**: Less comprehensive data

## 7. Monolithic Architecture

### Decision
Build as a monolithic Next.js application rather than microservices.

### Rationale
- **Simplicity**: Easier to develop, test, and deploy
- **Performance**: No network overhead between services
- **Development Speed**: Faster iteration and feature development
- **Cost-Effective**: Single deployment, lower infrastructure costs
- **Suitable Scale**: Appropriate for current and near-future scale
- **Easy Debugging**: Single codebase, easier to trace issues

### When to Consider Microservices
- User base exceeds 100,000 active users
- Need for independent scaling of components
- Team grows beyond 10 developers
- Different technology requirements for different features

## 8. Guest User Support with Local Storage

### Decision
Allow URL shortening without authentication, storing URLs in localStorage.

### Rationale
- **Lower Barrier to Entry**: Users can try the service immediately
- **Conversion Funnel**: Encourages sign-up to save URLs permanently
- **User Experience**: No forced registration for simple use cases
- **Auto-Sync**: URLs automatically sync when user logs in
- **Privacy**: Data stays on user's device until they choose to sync

### Implementation
```typescript
// Save to localStorage for guests
localStorage.setItem('savedUrls', JSON.stringify(urls));

// Sync on login
await fetch('/api/sync-urls', {
  method: 'POST',
  body: JSON.stringify({ userId, urls })
});
```

## 9. Referral System Architecture

### Decision
Implement referral system with separate referral user accounts and URL relationships.

### Rationale
- **Flexibility**: Referrals can have their own authentication
- **Tracking**: Separate Visit records for referral analytics
- **Permissions**: URL owners can enable/disable referrals
- **Scalability**: Supports multiple referrals per URL
- **Analytics**: Detailed referral performance metrics

### Data Model
- `allowReferrals` flag on URLs
- `referralId` links to referral user
- `originalUrlId` links referral URLs to original
- Separate `ReferralRequest` model for approval workflow

## 10. Soft Delete for URLs

### Decision
Implement soft delete with `DeletedUrl` model instead of hard deletion.

### Rationale
- **Data Recovery**: Ability to restore accidentally deleted URLs
- **Audit Trail**: Track what was deleted and when
- **Analytics Preservation**: Keep historical analytics data
- **Compliance**: Meet data retention requirements
- **User Experience**: "Undo delete" feature possibility

### Implementation
```typescript
// Move to DeletedUrl collection instead of deleting
await DeletedUrl.create({
  ...urlData,
  deletedAt: new Date(),
  deletedBy: userId
});
await Url.findByIdAndDelete(urlId);
```

## 11. URL Expiration with TTL Indexes

### Decision
Use MongoDB TTL (Time To Live) indexes for automatic URL expiration.

### Rationale
- **Automatic Cleanup**: MongoDB handles deletion automatically
- **Performance**: No cron jobs or scheduled tasks needed
- **Accuracy**: Deletion happens within 60 seconds of expiration
- **Scalability**: Efficient even with millions of documents
- **Simplicity**: Single index configuration

### Configuration
```typescript
UrlSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
```

## 12. Analytics Data Model

### Decision
Store each visit as a separate document in the Visits collection.

### Rationale
- **Granularity**: Detailed per-visit analytics
- **Flexibility**: Easy to add new tracking fields
- **Query Performance**: Indexed queries for fast analytics
- **Aggregation**: MongoDB aggregation pipeline for complex analytics
- **Historical Data**: Complete visit history preserved

### Trade-offs
- **Storage**: More storage than aggregated counters
- **Mitigation**: Implement data archival for old visits (future)

## 13. Password Reset Flow

### Decision
Use crypto-generated tokens with expiration for password reset.

### Rationale
- **Security**: Cryptographically secure random tokens
- **Time-Limited**: Tokens expire after 10 minutes
- **One-Time Use**: Token invalidated after use
- **Email-Based**: Secure delivery via email
- **No Password Storage**: Reset token hashed before storage

### Implementation
```typescript
const resetToken = crypto.randomBytes(20).toString('hex');
const hashedToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');
```

## 14. QR Code Generation

### Decision
Use qrcode.react for client-side QR code generation.

### Rationale
- **Client-Side**: No server load for QR generation
- **Multiple Formats**: SVG, PNG, various sizes
- **Customizable**: Error correction levels, margins
- **Performance**: Fast rendering with React
- **Download Options**: Easy export to different formats

### Formats Supported
- SVG (vector, scalable)
- PNG 300x300 (standard)
- PNG 1200x1200 (high resolution)

## 15. TypeScript Configuration

### Decision
Use strict TypeScript with ES2017 target.

### Rationale
- **Type Safety**: Catch errors at compile time
- **IDE Support**: Better autocomplete and refactoring
- **Documentation**: Types serve as inline documentation
- **Maintainability**: Easier to refactor with confidence
- **ES2017**: Balance between modern features and browser support

### Configuration Highlights
```json
{
  "strict": true,
  "target": "ES2017",
  "moduleResolution": "bundler",
  "paths": { "@/*": ["./src/*"] }
}
```

## 16. Error Handling Strategy

### Decision
Consistent error response format across all API endpoints.

### Rationale
- **Predictability**: Frontend knows what to expect
- **Debugging**: Consistent error messages aid debugging
- **User Experience**: Meaningful error messages for users
- **Logging**: Structured errors easier to log and monitor

### Error Response Format
```typescript
{
  success: false,
  error: "Human-readable error message",
  statusCode: 400 // HTTP status code
}
```

## 17. Environment Variable Management

### Decision
Use `.env.local` files with dotenv for configuration.

### Rationale
- **Security**: Sensitive data not in source control
- **Flexibility**: Different configs for dev/staging/prod
- **Next.js Integration**: Built-in support for env variables
- **Type Safety**: Can validate env vars at startup

### Required Variables
- `MONGODB_URI`: Database connection
- `JWT_SECRET`: Token signing key
- `IPINFO_TOKEN`: Geolocation API key

## 18. Component Organization

### Decision
Organize components by feature in `/component/ui` directory.

### Rationale
- **Reusability**: Shared components in one location
- **Maintainability**: Easy to find and update components
- **Consistency**: Enforces consistent UI patterns
- **Modularity**: Components can be used across pages

### Component Categories
- Modals (Delete, Extend, Suspend, Rename)
- Charts (Click charts, geographic distribution)
- UI Elements (Buttons, Cards, Badges, Alerts)
- Loading States (Spinners, skeletons)

## Future Considerations

### Potential Improvements
1. **Caching Layer**: Redis for frequently accessed URLs
2. **CDN Integration**: CloudFlare for global distribution
3. **Rate Limiting**: Prevent abuse and API spam
4. **Email Service**: Transactional emails for notifications
5. **Analytics Dashboard**: Advanced visualization tools
6. **API Versioning**: Support multiple API versions
7. **Webhook Support**: Real-time notifications for events
8. **Custom Domains**: Allow users to use their own domains
9. **Bulk Operations**: Import/export URLs in bulk
10. **A/B Testing**: Built-in A/B testing for shortened URLs

### Scalability Roadmap
1. **Phase 1** (Current): Monolithic Next.js app
2. **Phase 2**: Add Redis caching layer
3. **Phase 3**: Implement CDN for static assets
4. **Phase 4**: Consider microservices for analytics
5. **Phase 5**: Database sharding for horizontal scaling
