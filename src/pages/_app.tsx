import "../styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "@/components/Footer";

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"
    ),
  },
});

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <div className="flex flex-col min-h-screen bg-background text-textPrimary">
        <AnimatePresence mode="wait">
          <motion.main
            key={router.route}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-grow flex items-center justify-center"
          >
            <Component {...pageProps} />
          </motion.main>
        </AnimatePresence>

        <Footer />
      </div>
    </WagmiConfig>
  );
}
