"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Github, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  {
    href: "https://github.com/jk889971/WicketChain",
    label: "Github",
    external: true,
  },
];

export function LandingNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.1] bg-[rgba(14,14,14,0.6)] backdrop-blur-[12px]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-8 w-8 overflow-hidden transition-transform group-hover:scale-105">
            <Image
              src="/branding/logo-transparent.png"
              alt="WicketChain"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-lg font-bold tracking-wide uppercase text-[#56a963] font-heading">
            WicketChain
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = !link.external && pathname === link.href;
            const Component = link.external ? "a" : Link;
            const extraProps = link.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};

            return (
              <Component
                key={link.href}
                href={link.href}
                {...(extraProps as Record<string, string>)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                  isActive
                    ? "text-[#56a963] border-b-2 border-[#56a963]"
                    : "text-white/50 hover:text-white"
                )}
              >
                {link.label === "Github" && <Github size={14} />}
                {link.label}
              </Component>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <Link
            href="/matches"
            className="hidden md:inline-flex items-center gap-2 bg-[#56a963] hover:bg-[#4a9456] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(86,169,99,0.3)]"
          >
            Open dApp
            <ArrowRight size={14} />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[rgba(14,14,14,0.95)] backdrop-blur-xl">
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = !link.external && pathname === link.href;
              const Component = link.external ? "a" : Link;
              const extraProps = link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {};

              return (
                <Component
                  key={link.href}
                  href={link.href}
                  {...(extraProps as Record<string, string>)}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-all min-h-[44px] flex items-center gap-2",
                    isActive
                      ? "text-[#56a963] bg-[#56a963]/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label === "Github" && <Github size={14} />}
                  {link.label}
                </Component>
              );
            })}
            <Link
              href="/matches"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 bg-[#56a963] hover:bg-[#4a9456] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-300 min-h-[44px]"
            >
              Open dApp
              <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
