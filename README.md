# Sol9x School Portal

Enterprise-grade school management portal built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your `MONGODB_URI`.
4. **Run the development server**:
   ```bash
   npm run dev
   ```

## Folder Structure
- `src/app/(admin)`: Admin-specific routes and dashboard.
- `src/app/(student)`: Student-specific routes and dashboard.
- `src/components/ui`: shadcn/ui components.
- `src/components/admin`: Shared admin components.
- `src/components/student`: Shared student components.
- `src/lib/db`: Database connection utilities.
- `src/lib/models`: Mongoose schemas.
