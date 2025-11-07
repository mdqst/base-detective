import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 text-[11px] text-gray-600 flex flex-col items-center gap-1 pb-5">
      <div className="flex items-center space-x-2">
        <Link
          href="/about"
          className="text-gray-500 hover:text-blue-400 transition"
        >
          About
        </Link>

        <div className="w-2 h-2 bg-blue-500"></div>

        <a
          href="https://farcaster.xyz/mdqst"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition"
        >
          Built for Base by <span className="font-semibold">mdqst</span>
        </a>
      </div>
    </footer>
  );
}
