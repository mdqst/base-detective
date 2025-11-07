import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-12 text-xs text-gray-600 flex flex-col items-center gap-2 pb-6"
    >
      <div className="flex items-center space-x-2">
        <motion.span
          animate={{
            scale: [1, 1.3, 1],
            color: ["#60a5fa", "#3b82f6", "#60a5fa"],
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="text-blue-400 text-base"
        >
          💙
        </motion.span>
        <a
          href="https://farcaster.xyz/mdqst"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition text-sm"
        >
          Built for Base by <span className="font-semibold">mdqst</span>
        </a>

        {/* Divider */}
        <span className="text-gray-700">·</span>

        {/* About link */}
        <Link
          href="/about"
          className="text-sm text-gray-400 hover:text-blue-400 transition"
        >
          About
        </Link>
      </div>
    </motion.footer>
  );
}
