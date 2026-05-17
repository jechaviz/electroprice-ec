# ElectroPrice

A modern e-commerce price comparison platform for electronics, built with React, TypeScript, and PocketBase.

## Features

- Product price comparison from multiple wholesalers
- AI-powered product summaries using Google Gemini
- User reviews and ratings
- Multi-language support (English/Spanish)
- Currency conversion
- Smart filters for products
- Cart and checkout functionality
- Admin and retailer dashboards
- Responsive design with Tailwind CSS and DaisyUI

## Tech Stack

- Frontend: React 19, TypeScript, Vite
- Backend: PocketBase
- AI: Google Generative AI (Gemini)
- Styling: Tailwind CSS, DaisyUI
- Charts: Recharts
- Package Manager: npm (examples below use npm; Bun works with the same scripts)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or Bun
- PocketBase running locally or on a reachable host
- Google AI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your values:
   ```
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_APP_URL=http://localhost:5173
   VITE_VHUB_BASE_URL=http://127.0.0.1:8787
   VITE_VIMPORT_BASE_URL=http://127.0.0.1:8788
   ```
4. Set up PocketBase:
   Start PocketBase with `pocketbase serve`, create the superuser account, and then run:
   ```bash
   node pb/scripts/pb_setup.mjs
   ```
   The setup scripts default to `admin@electroprice.com` / `test1234`; override with `PB_SUPERUSER_EMAIL` and `PB_SUPERUSER_PASSWORD` when needed.
5. Start the development server:
   ```bash
   npm run dev
   ```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Type-check and build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Start Vitest in interactive/watch mode
- `npm run test:run` - Run tests once
- `npm run audit:providers` - Validate provider config inventory and secret hygiene
- `npm run audit:project` - Validate tracked project inventory, file-size limits, and architectural abstractions
- `npm run audit:build` - Validate production `dist/` bundle budgets and hashed assets after a build
- `npm run audit:deps` - Run a high-severity production dependency audit
- `npm run verify` - Run lint, tests once, production build, build audit, and project audit
- `npm run verify:release` - Run `verify` plus the production dependency audit

## Project Structure

- `src/components/` - React components
- `src/pages/` - Page components
- `src/contexts/` - React contexts for state management
- `src/hooks/` - Custom hooks
- `src/services/` - API services
- `src/utils/` - Utility functions
- `src/types.ts` - TypeScript type definitions
- `src/constants.ts` - Mock data and constants
- `config/providers/` - Frontend-safe provider config catalog for vhub and vimport

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run verify`
5. Submit a pull request

## License

MIT
