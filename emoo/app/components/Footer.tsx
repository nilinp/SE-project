import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="hidden lg:block lg:ml-20 bg-(--bg) border-t border-white/10 text-white/50 py-8 px-10">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">

        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <Image src="/icon.png" alt="E-MOO Logo" width={50} height={50} className="opacity-80" />
          <span className="font-bold text-white/70 tracking-wider text-sm">E-MOO</span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} E-MOO. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
