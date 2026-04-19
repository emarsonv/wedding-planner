# Wedding Planner

Guest management, table layout, and RSVP tracking for your wedding — built with Next.js, Supabase, Clerk, and Vercel.

---

## Tech stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: Clerk
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/wedding-planner.git
cd wedding-planner
npm install
```

### 2. Set up Clerk (authentication)

1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. Copy your **Publishable Key** and **Secret Key**

### 3. Set up Supabase (database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings → Database**
4. Copy the **Connection string** (Transaction mode, port 6543) → this is your `DATABASE_URL`
5. Copy the **Direct connection string** (port 5432) → this is your `DIRECT_URL`

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all values from steps 2 and 3.

### 5. Push the database schema

```bash
npm run db:push
```

This creates all tables in your Supabase database. To visually browse your data:

```bash
npm run db:studio
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign up and you're in.

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create wedding-planner --public --push
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your `wedding-planner` repository
4. Under **Environment Variables**, add all variables from your `.env.local`
5. Click **Deploy**

Vercel auto-deploys on every `git push` to main.

### 3. Add a custom domain (optional)

In your Vercel project → **Settings → Domains** → add your domain.
Buy a domain from Namecheap (~$12/year) and point the nameservers to Vercel.

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── guests/          # GET, POST /api/guests
│   │   │   └── [id]/        # PATCH, DELETE /api/guests/:id
│   │   ├── tables/          # GET, POST /api/tables
│   │   │   └── [id]/        # PATCH, DELETE /api/tables/:id
│   │   ├── assignments/     # POST, DELETE /api/assignments
│   │   └── event/           # PATCH /api/event
│   ├── dashboard/
│   │   ├── guests/          # Guest management page
│   │   ├── tables/          # Table layout page
│   │   ├── rsvp/            # RSVP analytics page
│   │   └── settings/        # Wedding settings page
│   ├── layout.tsx           # Root layout with Clerk provider
│   └── page.tsx             # Landing page
├── components/
│   ├── guests/
│   │   └── GuestsClient.tsx # Interactive guest table
│   ├── tables/
│   │   └── TablesClient.tsx # Interactive floor plan
│   └── SettingsClient.tsx
├── lib/
│   ├── prisma.ts            # Prisma singleton
│   └── utils.ts             # Helpers and constants
├── types/
│   └── index.ts             # Shared TypeScript types
└── middleware.ts             # Clerk route protection

prisma/
└── schema.prisma            # Database schema
```

---

## Database schema

| Table | Description |
|-------|-------------|
| `Event` | One per user — holds wedding name, date, venue |
| `Guest` | Name, group, meal preference, RSVP status, notes |
| `Table` | Name, seat count, position on floor plan |
| `Assignment` | Links one guest to one table (unique per guest) |

---

## Extending the app

Ideas for next features:

- **CSV import** — bulk upload guests from a spreadsheet
- **Email invites** — send RSVP links via Resend or SendGrid
- **Public RSVP page** — shareable link for guests to self-RSVP
- **Print/export** — generate a PDF seating chart
- **Drag-and-drop floor plan** — reposition tables with mouse
- **Multiple events** — support couples managing several events
- **Plus-one management** — link guests to their plus-ones

---

## Free tier limits

| Service | Free limit |
|---------|-----------|
| Vercel | Unlimited deploys, 100GB bandwidth/month |
| Supabase | 500MB database, 50,000 monthly active users |
| Clerk | 10,000 monthly active users |

More than enough for a wedding planning app.
