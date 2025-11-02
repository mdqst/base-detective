# 🕵️ Base Detective

Base Detective is a Farcaster Mini App: a dark-mode, text-based blockchain investigation game that runs on Base and records your final result on-chain.

Players solve an onchain incident by answering 10 multiple-choice questions. At the end, they can publish their outcome (success / partial / fail) to the Base blockchain. No NFTs, no tokens — just an immutable proof that they ran the investigation.

## Real value

- **On-chain education.** Users learn how real exploits happen (delegatecall abuse, proxy upgrades, leaked keys, mixers, bridges).
- **Security culture for DAOs / devs.** It's like a lightweight incident response simulation.
- **Public proof of participation.** The smart contract emits events (`CaseStarted`, `CaseCompleted`) that anyone can verify on Base.
- **Native to Farcaster.** It runs as a Mini App. You can connect the built-in Farcaster wallet OR any wallet via WalletConnect.

## Contract

- Address: `0xfbc5fbe823f76964de240433ad00651a76c672c8`
- Network: Base mainnet (chainId 8453)

### ABI (summary)
- `startCase(uint8 caseId)`
- `completeCase(uint8 caseId, uint8 result)`
- `playerCases(address player, uint8 caseId) view`

Flow:
1. `startCase` generates a per-player random seed (used to shuffle question order).
2. User answers 10 questions locally in the miniapp (off-chain).
3. `completeCase` writes only the final outcome on-chain and emits `CaseCompleted`.

## Tech stack

- Next.js (React 18)
- TailwindCSS (dark UI)
- wagmi + viem + connectkit (WalletConnect-compatible)
- @farcaster/miniapp-sdk (for in-app Farcaster wallet)
- Deployed to Vercel
- Manifest: `/public/farcaster.json`

## Environment variables

Set these in Vercel Project → Settings → Environment Variables:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xfbc5fbe823f76964de240433ad00651a76c672c8
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
```

You can get a WalletConnect project ID for free from WalletConnect Cloud.

## File layout

```text
public/
  farcaster.json    MiniApp manifest
  icon.png          App icon (shown in Farcaster UI)

src/
  abi/SmartContractDetective.ts
  components/WalletConnectButton.tsx
  data/questions_case1.json
  hooks/useContract.ts
  pages/_app.tsx
  pages/index.tsx
  styles/globals.css

package.json
tailwind.config.js
postcss.config.js
next.config.js
tsconfig.json
README.md
```

## Deploy steps

1. Create a public GitHub repo and upload this folder.
2. Import that repo in vercel.com → "Add New Project".
3. Add the env vars above.
4. Deploy.
5. Confirm your miniapp URL (ex: https://base-detective.vercel.app).
6. Make sure `https://base-detective.vercel.app/farcaster.json` is reachable.

Now you can paste the miniapp URL in Farcaster and it will render natively.

---

Built for Farcaster. Powered by Base.
