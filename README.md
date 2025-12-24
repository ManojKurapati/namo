# ECD Portal - Early Childhood Development Assessment Platform

A comprehensive Early Childhood Development (ECD) portal built with Next.js 14, featuring the ASQ (Ages & Stages Questionnaires) framework for developmental screening.

## Features

- 🔐 **Role-Based Authentication** - Admin, Owner, and Parent roles with NextAuth.js
- 👶 **Child Profile Management** - Parents can add and manage children's profiles
- 📋 **ASQ Questionnaire Engine** - Dynamic multi-step developmental assessments
- 📊 **Business Intelligence Dashboard** - Analytics and metrics for owners
- 🎥 **Intervention Videos** - Admin-managed educational content
- 📱 **Responsive Design** - Modern UI with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Vercel Postgres, Supabase, or Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ManojKurapati/namo.git
   cd namo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your deployment URL

4. **Generate Prisma client and push schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## User Roles

| Role | Access | Description |
|------|--------|-------------|
| **ADMIN** | `/admin` | Manage ASQ questions and intervention videos |
| **OWNER** | `/dashboard/owner` | View business analytics and metrics |
| **PARENT** | `/portal` | Manage children and complete assessments |

## ASQ Domains

The questionnaire covers 5 developmental domains:

1. **Communication** - Language and speech development
2. **Gross Motor** - Large muscle movements
3. **Fine Motor** - Small muscle movements and coordination
4. **Problem Solving** - Cognitive and learning skills
5. **Personal Social** - Self-help and social interaction

## Deployment to Vercel

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel domain)
4. Deploy!

### Post-Deployment

After the first deployment, run Prisma migrations:
```bash
npx prisma db push
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── dashboard/         # Owner dashboard
│   └── portal/            # Parent portal
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── forms/             # Form components
│   └── ui/                # Shadcn/UI components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── asq-utils.ts      # ASQ calculations
│   └── prisma.ts         # Prisma client
└── types/                 # TypeScript types
```

## License

MIT

## Author

Manoj Kurapati
