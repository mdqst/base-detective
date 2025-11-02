// src/pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { WagmiConfig, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";

// 👇 импортируем всё, что нужно, только внутри dynamic(), чтобы избежать ошибок сборки
const ConnectKitProvider = dynamic<any>(
  async () => {
    // @ts-ignore — отключаем проверку типов, чтобы TS не ругался на внутренние пути
    const mod = await import("connectkit");
    return mod.ConnectKitProvider;
  },
  { ssr: false }
);

// @ts-ignore — типы могут отсутствовать в пакете connectkit
import { getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    appName: "Base Detective",
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
      "YOUR_WALLETCONNECT_PROJECT_ID",
    chains: [base],
    transports: {
      [base.id]: http(
        process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"
      ),
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
