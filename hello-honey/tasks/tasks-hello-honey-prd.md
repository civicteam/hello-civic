# Tasks for hello-honey AI Character Generator

## Relevant Files

- `src/app/page.tsx` - Main login page component (currently default Next.js page, needs complete rewrite)
- `src/app/layout.tsx` - Root layout with dark theme setup (needs modification for dark theme)
- `src/app/globals.css` - Global styles for dark theme implementation
- `src/app/dashboard/page.tsx` - Main dashboard component with trait selection and character generation (new file)
- `src/app/api/generate-character/route.ts` - API route for AI character concept generation (new file)
- `src/app/api/generate-image/route.ts` - API route for AI image generation (new file)
- `src/app/api/mint-nft/route.ts` - API route for NFT minting process (new file)
- `src/lib/wallet.ts` - Solana wallet generation and management utilities (new file)
- `src/lib/solana.ts` - Solana blockchain interaction utilities (new file)
- `src/lib/ipfs.ts` - IPFS upload utilities for metadata and images (new file)
- `src/lib/ai.ts` - OpenAI integration utilities (new file)
- `src/types/index.ts` - TypeScript type definitions for traits, character, etc. (new file)
- `src/components/TraitSelector.tsx` - Component for trait selection dropdowns (new file)
- `src/components/CharacterDisplay.tsx` - Component for displaying generated character (new file)
- `src/components/WalletInfo.tsx` - Component for wallet address display (new file)
- `package.json` - Dependencies need to be added for Solana, OpenAI, IPFS

### Notes

- Use `npm run dev` to start development server
- Use `npm run build` to build the application
- Use `npm run lint` to run linting
- Environment variables will need to be configured in `.env.local`

## Tasks

- [ ] 1.0 Project Setup and Dependencies
  - [x] 1.1 Install required dependencies (@solana/web3.js, openai, ipfs-http-client, etc.) **(Partial - installed @civic/auth-web3)**
  - [ ] 1.2 Configure environment variables template
  - [ ] 1.3 Update package.json scripts if needed
  - [ ] 1.4 Create TypeScript type definitions file

- [x] 2.0 Authentication and Wallet Generation
  - [x] 2.1 Implement Solana wallet generation utility **(Using Civic Auth embedded wallets)**
  - [x] 2.2 Create wallet management context/state **(Using CivicAuthProvider)**
  - [x] 2.3 Build login page with single login button **(UserButton on homepage)**
  - [x] 2.4 Implement login flow with wallet generation **(Complete with Civic Auth)**

- [ ] 3.0 Dashboard and UI Components
  - [x] 3.1 Create dashboard page structure
  - [x] 3.2 Implement WalletInfo component with address display and copy functionality **(WalletSection component)**
  - [ ] 3.3 Build TraitSelector component with four dropdown menus
  - [ ] 3.4 Create CharacterDisplay component for showing generated content
  - [ ] 3.5 Implement dark theme styling throughout application

- [ ] 4.0 AI Integration and Character Generation
  - [ ] 4.1 Set up OpenAI API integration utility
  - [ ] 4.2 Create API route for character concept generation
  - [ ] 4.3 Create API route for image prompt optimization
  - [ ] 4.4 Create API route for image generation
  - [ ] 4.5 Implement character generation flow in dashboard

- [ ] 5.0 NFT Minting and Blockchain Integration
  - [ ] 5.1 Implement IPFS upload functionality for images and metadata
  - [ ] 5.2 Create Solana blockchain interaction utilities
  - [ ] 5.3 Build NFT minting API route
  - [ ] 5.4 Implement mint button and transaction flow
  - [ ] 5.5 Add transaction confirmation and explorer links