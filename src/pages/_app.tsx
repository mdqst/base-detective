import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    appName: "Base Detective",
    alchemyId: undefined,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID",
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
