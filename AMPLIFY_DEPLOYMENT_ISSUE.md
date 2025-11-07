# AWS Amplify Deployment Issue - Frontend Apps (9 Failed Attempts)

## Problem Summary
Cannot deploy Next.js frontend apps (client & admin) to AWS Amplify despite **both apps building successfully locally**. After 9 failed deployment attempts, getting errors related to:
1. `next: command not found`
2. `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "next" not found`
3. Build commands not resolving correctly in monorepo

## Repository Structure
```
microservices-ecommerce/
├── package.json                 # Root: "build": "turbo run build"
├── pnpm-workspace.yaml          # Defines: apps/*, packages/*
├── turbo.json                   # Turborepo config
├── amplify.yml                  # Root-level monorepo config
├── apps/
│   ├── client/                  # Next.js 15.4.5 SSR app
│   │   ├── package.json         # "build": "next build"
│   │   ├── next.config.ts       # output: 'standalone'
│   │   └── node_modules/.bin/next  ✅ EXISTS LOCALLY
│   ├── admin/                   # Next.js 15.4.5 SSR app
│   │   ├── package.json         # "build": "next build"
│   │   ├── next.config.ts       # output: 'standalone'
│   │   └── node_modules/.bin/next  ✅ EXISTS LOCALLY
│   └── [7 backend services...]  # NOT being deployed to Amplify
└── packages/
    └── product-db/              # Prisma schema (needs generation)
```

## Local Build Status
✅ **WORKS PERFECTLY**:
- `cd apps/client && pnpm build` → Builds successfully
- `cd apps/admin && pnpm build` → Builds successfully
- Both use Next.js 15.4.5 with SSR (`output: 'standalone'`)
- `next` binaries exist in `apps/client/node_modules/.bin/next` and `apps/admin/node_modules/.bin/next`

## Current amplify.yml Configuration
```yaml
version: 1
applications:
  - appRoot: apps/client
    frontend:
      phases:
        preBuild:
          commands:
            - npm install -g pnpm
            - pnpm install                                           # Installs from ROOT
            - cd ../../packages/product-db && pnpm db:generate && cd ../..
        build:
          commands:
            - pnpm build                                             # ❌ FAILS HERE
      artifacts:
        baseDirectory: .next/standalone
        files:
          - '**/*'
      cache:
        paths:
          - ../../.pnpm-store/**/*
          - .next/cache/**/*
          - ../../packages/product-db/generated/**/*
          - ../../node_modules/.pnpm/**/*
          - ../../node_modules/@repo/**/*
          - ../../node_modules/next/**/*
  - appRoot: apps/admin
    frontend:
      phases:
        preBuild:
          commands:
            - npm install -g pnpm
            - pnpm install
            - cd ../../packages/product-db && pnpm db:generate && cd ../..
        build:
          commands:
            - pnpm build                                             # ❌ FAILS HERE
      artifacts:
        baseDirectory: .next/standalone
        files:
          - '**/*'
      cache:
        paths: [same as client]
```

## Key Configuration Files

### Root package.json
```json
{
  "name": "ecom",
  "scripts": {
    "build": "turbo run build",    // ⚠️ This might be the issue!
    "dev": "turbo run dev"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### apps/client/package.json
```json
{
  "name": "client",
  "scripts": {
    "build": "next build",          // ✅ What we WANT to run
    "dev": "next dev --turbopack --port 3002"
  },
  "dependencies": {
    "next": "15.4.5",
    "@clerk/nextjs": "^6.31.10"
  }
}
```

### apps/client/next.config.ts
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',              // For Amplify SSR
  images: {
    remotePatterns: [/* ... */]
  }
};
```

## Failed Attempts (Commands Tried)

| Attempt | Command in amplify.yml | Error |
|---------|------------------------|-------|
| 1-3 | `next build` | `next: command not found` |
| 4-5 | `pnpm next build` | `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "next" not found` |
| 6-7 | `pnpm --filter client build` | Turborepo ran ALL 15 projects, cache >5GB |
| 8-9 | `pnpm build` | `Command "next" not found` |

## Core Issue Analysis

### How Amplify Executes with `appRoot`
1. **preBuild phase**: Runs commands from `appRoot` (e.g., `apps/client/`)
2. **build phase**: Also runs from `appRoot` (e.g., `apps/client/`)
3. **Problem**: When in `apps/client/`, running `pnpm build` might:
   - Execute ROOT's `package.json` script (`turbo run build`) instead of local one
   - Or fail to find `next` binary because pnpm doesn't resolve it correctly in subdirectory

### Why It Works Locally But Not on Amplify
- **Locally**: pnpm symlinks are set up correctly, `next` is in `apps/client/node_modules/.bin/next`
- **Amplify**: After `pnpm install` from root, when `appRoot` changes context to `apps/client/`, the binary resolution breaks

## What Needs to be Solved

1. **How to run `next build` from `apps/client/` directory when `appRoot: apps/client`?**
   - The `next` binary should exist after `pnpm install`
   - But pnpm can't find it when executing from subdirectory

2. **How to ensure pnpm runs the LOCAL package.json's `build` script, not the root's?**
   - Root has: `"build": "turbo run build"`
   - Local has: `"build": "next build"`
   - Need to ensure local script is executed

3. **Correct artifact path for Next.js standalone output?**
   - Currently: `baseDirectory: .next/standalone` (relative to `appRoot`)
   - Is this correct for Next.js 15 standalone builds?

## Environment Details
- **Package Manager**: pnpm@9.0.0
- **Node Version**: >=18
- **Next.js Version**: 15.4.5
- **Amplify Hosting**: SSR mode (not static export)
- **Monorepo Tool**: Turborepo 2.5.6
- **Workspace Projects**: 15 total (7 backend services + 2 frontend apps + 6 packages)

## Questions for Resolution

1. What is the correct build command to run Next.js from a subdirectory in a pnpm monorepo on Amplify?
2. Should I use `npx next build` instead of `pnpm build` to avoid pnpm's script resolution?
3. Is the `baseDirectory: .next/standalone` correct, or should it be `apps/client/.next/standalone`?
4. Do I need to adjust the `preBuild` commands to change working directories differently?
5. Should I use `pnpm exec next build` to explicitly execute the local binary?

## Expected Outcome
Both `apps/client` and `apps/admin` should build successfully on Amplify, creating standalone Next.js builds that can be deployed and run as SSR applications.

## Additional Context
- All backend services are deployed to ECS Fargate (working fine)
- Frontend apps use Clerk for auth, Stripe for payments
- Both apps have been tested locally and work perfectly
- The only blocker is getting the build command to work on Amplify

---

**Last Updated**: Nov 6, 2025 after 9 failed deployment attempts

