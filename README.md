# VeloRent - Bicycle Rental Platform

A modern, full-featured bicycle rental platform built with Next.js 16, React 19, and Prisma ORM.

## Features

- User authentication with JWT
- Admin dashboard for bike management
- Bike browsing and filtering
- Online booking system
- Order management
- Responsive design with Tailwind CSS
- TypeScript for type safety

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **UI:** React 19.2.3
- **Styling:** Tailwind CSS 4
- **Database:** Prisma ORM (SQLite dev / PostgreSQL prod)
- **Authentication:** JWT + bcryptjs
- **Language:** TypeScript

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

## Getting Started Locally

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/velorent.git
cd velorent/bike-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize the database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database with sample data
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
bike-app/
├── app/                 # Next.js app directory
│   ├── (admin)/        # Admin routes
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   └── page.tsx        # Home page
├── components/         # Reusable components
├── context/           # React context providers
├── lib/               # Utility functions
├── prisma/            # Database schema and migrations
├── public/            # Static assets
└── types/             # TypeScript type definitions
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Building
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma studio    # Open Prisma Studio

# Seeding
npm run db:seed      # Seed database with sample data
npm run db:seed-admin # Create admin user

# Testing
npm test             # Run unit tests
npm run test:e2e     # Run E2E tests with Playwright

# Linting
npm run lint         # Run ESLint
```

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deploy to Vercel + Supabase

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Set up Supabase**
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Get database connection string

3. **Deploy to Vercel**
   - Import repository on [vercel.com](https://vercel.com)
   - Add environment variables:
     - `DATABASE_URL` - Supabase connection string
     - `JWT_SECRET` - Random 32+ character string
     - `NODE_ENV` - "production"
   - Deploy!

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` or `postgresql://...` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Public URL of your app | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` or `production` |

## Database Schema

### Models

- **Bike** - Bicycle inventory with details, pricing, and availability
- **User** - User accounts with authentication and roles
- **Booking** - Rental bookings with customer information

See `prisma/schema.prisma` for full schema.

## Admin Access

1. Sign up as a new user
2. Update user role to "admin" via database:

```sql
UPDATE "User" SET "role" = 'admin' WHERE "email" = 'your-email@example.com';
```

3. Access admin panel at `/admin`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software.

## Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

**Built with** Next.js + React + Prisma + Tailwind CSS
