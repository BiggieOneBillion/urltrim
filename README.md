# URLTRIM - URL Shortener Platform

A modern, feature-rich URL shortening platform built with Next.js 15, offering advanced analytics, referral tracking, and comprehensive link management capabilities.

## 🚀 Features

### Core Functionality
- **URL Shortening**: Convert long URLs into compact, shareable links
- **Custom Aliases**: Create memorable custom short URLs
- **QR Code Generation**: Generate QR codes in multiple formats (SVG, PNG, PNG 1200px)
- **Link Expiration**: Set custom expiration dates for shortened URLs
- **Link Suspension**: Temporarily disable URLs without deletion

### Analytics & Tracking
- **Detailed Click Analytics**: Track total clicks, unique visitors, and engagement metrics
- **Geographic Distribution**: View visitor locations with country, city, and coordinates
- **Device Analytics**: Monitor device types, browsers, and operating systems
- **ISP & Organization Tracking**: Identify visitor ISPs and organizations
- **Real-time Statistics**: Access up-to-date analytics dashboards

### User Management
- **User Authentication**: Secure JWT-based authentication system
- **User Dashboard**: Centralized management of all shortened URLs
- **Password Recovery**: Email-based password reset functionality
- **Profile Management**: Update user information and preferences

### Referral System
- **Referral Links**: Create referral-enabled shortened URLs
- **Referral Tracking**: Monitor referral performance and conversions
- **Referral Analytics**: Detailed insights into referral traffic
- **Referral Requests**: Manage and approve referral partnerships

### Additional Features
- **Guest Mode**: Shorten URLs without authentication (saved locally)
- **Auto-sync**: Automatically sync guest URLs when logging in
- **Responsive Design**: Fully responsive UI for all devices
- **Dark Theme**: Modern black-and-white aesthetic
- **Share Integration**: Native share API support for mobile devices

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v5.0 or higher
- **npm/yarn/pnpm**: Latest version

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd urltrim-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/url-shortener
   
   # Authentication
   JWT_SECRET=your_jwt_secret_key_here
   
   # Geolocation API
   IPINFO_TOKEN=your_ipinfo_token_here
   
   # Application
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
urltrim-main/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── auth/              # Authentication endpoints
│   │   │   ├── shorten/           # URL shortening endpoint
│   │   │   ├── stats/             # Analytics endpoints
│   │   │   ├── urls/              # URL management endpoints
│   │   │   ├── referral/          # Referral endpoints
│   │   │   └── referrals/         # Referral management
│   │   ├── component/             # React components
│   │   │   └── ui/                # UI components
│   │   ├── context/               # React context providers
│   │   ├── dashboard/             # Dashboard pages
│   │   ├── models/                # Mongoose models
│   │   │   ├── User.ts           # User model
│   │   │   ├── Url.ts            # URL, Visit, Referral models
│   │   │   ├── DeletedUrl.ts     # Deleted URL tracking
│   │   │   └── ReferralRequest.ts # Referral requests
│   │   ├── middleware/            # Custom middleware
│   │   ├── utils/                 # Utility functions
│   │   ├── login/                 # Login page
│   │   ├── register/              # Registration page
│   │   ├── forgot-password/       # Password recovery
│   │   ├── stats/                 # Statistics pages
│   │   ├── suspended/             # Suspended URL page
│   │   └── [shortId]/            # URL redirect handler
│   ├── libs/
│   │   ├── db.ts                 # Database connection
│   │   └── geo.ts                # Geolocation utilities
│   └── middleware.ts             # Next.js middleware (auth)
├── public/                        # Static assets
├── .env.local                     # Environment variables (create this)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS configuration
├── eslint.config.mjs             # ESLint configuration
└── package.json                  # Dependencies and scripts
```

## 🔧 Configuration

### Database Configuration
The application uses MongoDB with Mongoose ODM. Configure your database connection in `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/url-shortener
```

### JWT Configuration
Set a strong secret key for JWT token generation:
```env
JWT_SECRET=your_very_secure_random_string_here
```

### Geolocation API
Sign up for an IPInfo token at [ipinfo.io](https://ipinfo.io) and add it to your environment:
```env
IPINFO_TOKEN=your_token_here
```

## 📚 API Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🏗️ Architecture

For architectural details and system design, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## 💻 Tech Stack

For a comprehensive list of technologies used, see [TECH_STACK.md](./TECH_STACK.md)

## 🎨 Design Decisions

For insights into key design choices, see [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md)

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production
Ensure all environment variables are set in your production environment:
- `MONGODB_URI`
- `JWT_SECRET`
- `IPINFO_TOKEN`
- `NEXT_PUBLIC_BASE_URL`

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build test
npm run build
```

## 📝 Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database solution
- IPInfo for geolocation services
- All open-source contributors

## 📧 Support

For support, email support@urltrim.com or open an issue in the repository.

## 🔗 Links

- [Documentation](./docs)
- [API Reference](./API_DOCUMENTATION.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Tech Stack](./TECH_STACK.md)
