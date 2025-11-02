import "../styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <div className="bg-background text-textPrimary min-h-screen">
        <Component {...pageProps} />
      </div>
    </WagmiConfig>
  );
}
