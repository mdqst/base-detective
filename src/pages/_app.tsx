import "../styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { WagmiConfig, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { getDefaultConfig } from "connectkit/dist/es/getDefaultConfig";

// ✅ import ConnectKitProvider from its ESM bundle directly
const ConnectKitProvider = dynamic(
  async () => (await import("connectkit/dist/es/ConnectKitProvider")).ConnectKitProvider,
  { ssr: false }
);

const config = createConfig(
  getDefaultConfig({
    appName: "Base Detective",
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID",
    chains: [base],
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
    },
  })
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider mode="dark">
        <div className="bg-background text-textPrimary min-h-screen">
          <Component {...pageProps} />
        </div>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
