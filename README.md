# Storefront — AI-Powered E-commerce Storefront Builder

Next.js application for building dynamic e-commerce storefronts with AI-powered page generation, drag-and-drop editing, and subdomain management.

---

## Quick Start

```bash
npm install
# or
yarn install

npm run dev
# or
yarn dev

# open http://localhost:3000
```

## Environment Setup

### Quick Start (Build Without Env Vars)
**Good news!** The build works without environment variables. You can clone and build immediately:

```bash
git clone <your-repo-url>
cd storeFront
npm install
npm run build  # ✅ Will succeed without .env.local
```

### Full Setup (For Runtime Features)
For the app to work at runtime, create `.env.local`:

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your API keys
nano .env.local
```

See **[ENV_SETUP.md](./ENV_SETUP.md)** for detailed instructions.

**Minimum required for runtime:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key (for authentication)
- `ANTHROPIC_API_KEY` - Claude API key (for AI generation)
- `CLOUDFLARE_API_TOKEN` & `CLOUDFLARE_ZONE_ID` - For subdomain management

> **Note:** Build succeeds without env vars, but runtime features (auth, AI, subdomains) won't work without proper values.

## Documentation

📚 **All documentation is organized in the [`docs/`](./docs/) folder.**

### Quick Links

- **[Documentation Index](./docs/README.md)** - Complete documentation overview
- **[API Keys Setup](./docs/API_KEYS_SETUP.md)** - Set up Cloudflare and Claude API keys
- **[Firebase Setup](./docs/FIREBASE_SETUP.md)** - Configure Firebase
- **[Architecture Guide](./docs/ARCHITECTURE_RECOMMENDATIONS.md)** - System architecture and design decisions

### Key Features

- 🤖 **AI-Powered Generation** - Generate complete e-commerce sites with Claude 3.5 Sonnet
- 🎨 **Drag & Drop Editor** - Edit pages with GrapesJS
- 🌐 **Subdomain Management** - Automatic subdomain creation with Cloudflare
- 📄 **Dynamic Routing** - Create custom pages with pretty URLs
- 💳 **Plan-Based Limits** - Subscription plan limits for storefronts and pages
- 🔐 **Authentication** - Firebase Auth with Google Sign-In

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── editor/            # GrapesJS editor
│   └── storefront/        # Dynamic storefront pages
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── wizard/           # Storefront wizard
│   └── editor/           # Editor components
├── services/             # Business logic
│   ├── ai.ts             # AI generation service
│   ├── firebase.ts       # Firebase operations
│   ├── planLimits.ts     # Plan limits management
│   └── cloudflare.ts     # Cloudflare DNS API
├── docs/                 # 📚 All documentation
└── middleware.ts         # Subdomain routing
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: HeroUI (NextUI), Tailwind CSS
- **AI**: Anthropic Claude 3.5 Sonnet
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **DNS**: Cloudflare API
- **Editor**: GrapesJS
- **State**: Redux Toolkit + Redux Persist

## Getting Started

1. **Set up API keys** - See [API Keys Setup](./docs/API_KEYS_SETUP.md)
2. **Configure Firebase** - See [Firebase Setup](./docs/FIREBASE_SETUP.md)
3. **Set up subdomains** - See [Subdomain Setup Guide](./docs/SUBDOMAIN_SETUP_GUIDE.md)
4. **Initialize plans** - Run `initializeDefaultPlans()` once

For detailed setup instructions, see the [Documentation Index](./docs/README.md).

## License

Private project - All rights reserved.
