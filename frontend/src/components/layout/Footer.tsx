"use client";

import Image from "next/image";
import Link from "next/link";
import { EXPLORER_URL } from "@/config/chain";
import { CONTRACTS } from "@/config/contracts";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 justify-items-center lg:justify-items-start text-center lg:text-left">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="relative h-8 w-8">
                <Image
                  src="/branding/logo-transparent.png"
                  alt="WicketChain"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-white">WicketChain</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Decentralized cricket ticketing powered by blockchain. Soulbound
              NFT tickets, stadium shops, and transparent treasury management.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navigate</h4>
            <ul className="space-y-2">
              {[
                { href: "/matches", label: "Browse Matches" },
                { href: "/tickets", label: "My Tickets" },
                { href: "/shops", label: "Stadium Shops" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 hover:text-[#56a963] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contracts */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              Smart Contracts
            </h4>
            <ul className="space-y-2">
              {[
                { label: "TicketNFT", addr: CONTRACTS.ticketNFT },
                { label: "StadiumShop", addr: CONTRACTS.stadiumShop },
                { label: "Vault", addr: CONTRACTS.vault },
                { label: "VenueRegistry", addr: CONTRACTS.venueRegistry },
                { label: "UserProfile", addr: CONTRACTS.userProfile },
              ].map((c) => (
                <li key={c.label}>
                  <a
                    href={`${EXPLORER_URL}/address/${c.addr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/40 hover:text-[#56a963] transition-colors font-mono"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Built For</h4>
            <p className="text-sm text-white/40 leading-relaxed">
              WireFluid Hackathon 2026
            </p>
            <div className="mt-4 flex items-center justify-center lg:justify-start gap-2">
              <div className="h-2 w-2 rounded-full bg-[#56a963] animate-pulse" />
              <span className="text-xs text-white/30">
                Live on WireFluid Testnet
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} WicketChain. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              Block Explorer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
