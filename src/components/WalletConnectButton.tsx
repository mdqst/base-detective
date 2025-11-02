import { useEffect, useState } from "react";
import { ConnectKitButton } from "connectkit";

export default function WalletConnectButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="text-center">
      <ConnectKitButton.Custom>
        {({ isConnected, show, address }) => {
          return (
            <button
              onClick={show}
              className="rounded-xl bg-accent text-white px-4 py-2 text-sm font-medium shadow-lg shadow-blue-500/20 hover:opacity-90 transition"
            >
              {isConnected
                ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
                : "Connect Wallet"}
            </button>
          );
        }}
      </ConnectKitButton.Custom>
    </div>
  );
}
