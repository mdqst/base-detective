export default function Footer() {
  return (
    <footer className="text-[11px] text-textSecondary text-center mt-6 mb-3">
      <div className="flex justify-center gap-3">
        <a
          href="/"
          className="hover:text-white transition"
        >
          Main
        </a>
        <a
          href="/tools"
          className="hover:text-white transition"
        >
          Tools
        </a>
        <a
          href="/playground"
          className="hover:text-white transition"
        >
          Playground
        </a>
        <a
          href="/about"
          className="hover:text-white transition"
        >
          About
        </a>
      </div>
      <div className="mt-2 flex justify-center items-center gap-1">
        <span className="w-2.5 h-2.5 bg-[#0000ff] rounded-none"></span>
        <a
          href="https://farcaster.xyz/mdqst"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition"
        >
          Built for Base by mdqst
        </a>
      </div>
    </footer>
  );
}
