import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-center text-xs text-gray-400 pb-6 mt-4">
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-4">
          <Link
            href="/tools"
            className="hover:text-white transition-colors duration-200"
          >
            Tools
          </Link>
          <Link
            href="/about"
            className="hover:text-white transition-colors duration-200"
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-1 text-[11px] mt-0.5">
          <div
            className="w-2 h-2"
            style={{ backgroundColor: "#0000ff" }}
          />
          <span>
            Built for Base by{" "}
            <a
              href="https://farcaster.xyz/mdqst"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              mdqst
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
