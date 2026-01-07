# PJUTS ESDM Backend

Sistem backend untuk monitoring Penerangan Jalan Umum Tenaga Surya (PJUTS) - Kementerian Energi dan Sumber Daya Mineral Indonesia.

## 🏗️ Tech Stack

- **Runtime/API**: Next.js 15 with Server Actions (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Validation**: Zod
- **Styling**: Tailwind CSS

## 📋 Features

- ✅ Type-safe API with Server Actions
- ✅ High-resolution image upload to Cloudflare R2
- ✅ PostgreSQL database with Prisma ORM
- ✅ Indonesian geospatial validation (coordinates within Indonesia)
- ✅ Role-based access control (Admin/Field Staff)
- ✅ Dashboard statistics and province aggregation
- ✅ Map points with status filtering
- ✅ Report submission with automatic unit status updates

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudflare R2 bucket

### 1. Clone & Install

```bash
cd pjuts-esdm
npm install
```

### 2. Environment Setup

Copy `env.example.txt` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pjuts_esdm?schema=public"

# NextAuth
AUTH_SECRET="your-super-secret-key-generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Cloudflare R2
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="pjuts-esdm"
R2_PUBLIC_URL="https://your-bucket.r2.dev"

# Database Seed (only needed for initial setup)
SEED_ADMIN_PASSWORD="your-secure-admin-password"
SEED_STAFF_PASSWORD="your-secure-staff-password"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Project Structure

```
├── app/
│   ├── actions/           # Server Actions
│   │   ├── reports.ts     # Report submission & retrieval
│   │   ├── dashboard.ts   # Dashboard statistics
│   │   ├── map.ts         # Map points & clusters
│   │   └── units.ts       # PJUTS unit management
│   ├── api/               # API Routes (REST)
│   │   ├── auth/          # NextAuth handlers
│   │   ├── dashboard/     # Dashboard API
│   │   ├── map/           # Map API
│   │   └── units/         # Units API
│   ├── login/             # Login page
│   └── page.tsx           # Landing page
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   ├── r2.ts              # Cloudflare R2 service
│   └── validations.ts     # Zod schemas
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
└── types/
    └── index.ts           # TypeScript types
```

## 🔐 Authentication

### User Accounts

After running `npm run db:seed`, the following accounts are created:

| Role | Email |
|------|-------|
| Admin | admin@esdm.go.id |
| Field Staff | petugas1@esdm.go.id |
| Field Staff | petugas2@esdm.go.id |
| Field Staff | petugas3@esdm.go.id |

> **Note:** Passwords are set from environment variables `SEED_ADMIN_PASSWORD` and `SEED_STAFF_PASSWORD`.

### Role Permissions

- **Admin**: Full access to all features, can create/delete units and reports
- **Field Staff**: Can submit reports and view their own submissions

## 📡 API Reference

### Server Actions (Recommended)

Import from `@/app/actions`:

```typescript
import { 
  submitReport,
  getDashboardStats,
  getMapPoints,
  getPjutsUnits
} from "@/app/actions";
```

### REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | Dashboard statistics |
| `/api/map` | GET | Map points (supports bounds & status filters) |
| `/api/units` | GET | Paginated units list |
| `/api/units/provinces` | GET | List of provinces |

## 📊 Database Schema

### Models

- **User**: System users with roles
- **PjutsUnit**: Solar street light units with location data
- **Report**: Field reports with images and voltage readings

### Unit Status Values

- `OPERATIONAL` - Unit is working normally
- `MAINTENANCE_NEEDED` - Unit needs maintenance (voltage 10-20V)
- `OFFLINE` - Unit is not functioning (voltage < 10V)
- `UNVERIFIED` - Newly added, not yet verified

## 🗺️ Geospatial Validation

All coordinates are validated to be within Indonesian boundaries:

- **Latitude**: -11.0 to 6.0
- **Longitude**: 95.0 to 141.0

## 🖼️ Image Upload

- Supports JPEG, PNG, WebP
- Auto-converts to WebP for optimization
- Max size: 10MB
- Stored in R2 with path: `reports/{province}/{unit_id}/{timestamp}.webp`

## 🛠️ Development

### Prisma Commands

```bash
# Generate client after schema changes
npm run db:generate

# Push schema to database
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Type Generation

Types are auto-generated by Prisma. Run `npm run db:generate` after schema changes.

## 📝 License

This project is developed for Kementerian ESDM Republik Indonesia.

