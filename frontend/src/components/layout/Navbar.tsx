"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X, Shield, Store, Ticket, ShoppingBag, ShoppingCart, LogOut, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils/truncateAddress";
import { NetworkBanner } from "./NetworkBanner";
import { useUserRole } from "@/hooks/useUserRole";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

const FAN_LINKS = [
  { href: "/matches", label: "Matches" },
  { href: "/shops",   label: "Shops"   },
];

const ADMIN_LINKS = [
  { href: "/admin/shops",      label: "Shops"      },
  { href: "/admin/venues",     label: "Venues"     },
  { href: "/admin/matches",    label: "Matches"    },
  { href: "/admin/settlement", label: "Settlement" },
  { href: "/admin/analytics",  label: "Analytics"  },
];

/* ─── Profile Avatar Dropdown ──────────────────────────────────── */
function ProfileDropdown() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [shopExists, setShopExists] = useState(false);
  const [copied, setCopied]         = useState(false);

  // Check once on connect whether this wallet already has a shop
  useEffect(() => {
    if (!address) { setShopExists(false); return; }
    supabase
      .from("shops")
      .select("id", { count: "exact", head: true })
      .eq("owner_address", address.toLowerCase())
      .then(({ count }) => setShopExists((count ?? 0) > 0));
  }, [address]);

  const shortAddr = address ? truncateAddress(address) : "";

  // Generate a stable hue from the address for the avatar ring
  const hue = address ? (parseInt(address.slice(2, 4), 16) * 5) % 360 : 140;
  const initials = address ? address.slice(2, 4).toUpperCase() : "??";

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <DropdownMenu.Root>
      {/* ── Avatar trigger ── */}
      <DropdownMenu.Trigger asChild>
        <button
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white/10 hover:ring-[#56a963]/50 transition-all focus:outline-none"
          style={{
            background: `linear-gradient(135deg, hsl(${hue},55%,35%) 0%, hsl(${hue},45%,22%) 100%)`,
          }}
          aria-label="Profile menu"
        >
          {initials}
        </button>
      </DropdownMenu.Trigger>

      {/* ── Dropdown panel ── */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-50 w-56 rounded-xl border border-white/10 bg-[rgba(18,18,18,0.97)] backdrop-blur-xl shadow-2xl p-1.5
                     data-[state=open]:animate-in data-[state=closed]:animate-out
                     data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                     data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
                     data-[side=bottom]:slide-in-from-top-2"
        >
          {/* Links */}
          <DropdownMenu.Item asChild>
            <Link
              href="/tickets"
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors outline-none cursor-pointer"
            >
              <Ticket size={14} className="text-[#a5fcad] shrink-0" />
              My Tickets
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/shops/my-orders"
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors outline-none cursor-pointer"
            >
              <ShoppingBag size={14} className="text-[#a5fcad] shrink-0" />
              My Orders
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/vendor/dashboard"
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors outline-none cursor-pointer"
            >
              <Store size={14} className="text-[#a5fcad] shrink-0" />
              {shopExists ? "Vendor Dashboard" : "Open a Shop"}
            </Link>
          </DropdownMenu.Item>

          {/* Divider */}
          <DropdownMenu.Separator className="my-1.5 h-px bg-white/[0.06]" />

          {/* Address row */}
          <div className="px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-xs text-white/30 font-mono truncate">{shortAddr}</span>
            <button
              onClick={copyAddress}
              className="text-white/30 hover:text-white/70 transition-colors shrink-0"
              title="Copy address"
            >
              {copied ? <Check size={12} className="text-[#56a963]" /> : <Copy size={12} />}
            </button>
          </div>

          {/* Disconnect */}
          <DropdownMenu.Item
            onSelect={() => disconnect()}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors outline-none cursor-pointer"
          >
            <LogOut size={14} className="shrink-0" />
            Disconnect
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/* ─── Navbar ────────────────────────────────────────────────────── */
export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { hasAdminAccess, hasAnyAdminAccess, isEventManager } = useUserRole();
  const { cartCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOnAdminPage = pathname.startsWith("/admin");

  const showAdminNav = hasAnyAdminAccess && isOnAdminPage;
  const activeLinks  = showAdminNav ? ADMIN_LINKS : FAN_LINKS;
  // Event-only managers land on /admin/matches; full admins land on /admin/venues
  const adminEntryHref = (hasAdminAccess || !isEventManager) ? "/admin/venues" : "/admin/matches";

  return (
    <>
      <NetworkBanner />
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden transition-transform group-hover:scale-105">
              <Image
                src="/branding/logo-transparent.png"
                alt="WicketChain"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
              WicketChain
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden min-[900px]:flex items-center gap-1">
            {activeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href) && link.href.length > 1)
                    ? "text-white bg-[#56a963]/20 border border-[#56a963]/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Admin toggle */}
            {hasAnyAdminAccess && !isOnAdminPage && (
              <Link
                href={adminEntryHref}
                className="ml-1 px-3 py-2 text-sm font-medium text-amber-400/70 hover:text-amber-400 rounded-lg transition-all duration-200 hover:bg-amber-400/5 flex items-center gap-1.5"
              >
                <Shield size={14} />
                Admin
              </Link>
            )}
            {isOnAdminPage && (
              <Link
                href="/matches"
                className="ml-1 px-3 py-2 text-sm font-medium text-[#56a963]/70 hover:text-[#56a963] rounded-lg transition-all duration-200 hover:bg-[#56a963]/5"
              >
                Fan View
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Cart icon — always visible */}
            <button
              onClick={openCart}
              className="relative p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#56a963] text-[#002a0c] text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Wallet: show avatar dropdown when connected, ConnectButton when not */}
            {isConnected ? (
              <ProfileDropdown />
            ) : (
              /* Custom connect button — plain green pill */
              <ConnectButton.Custom>
                {({ openConnectModal, mounted }) => (
                  <button
                    onClick={openConnectModal}
                    disabled={!mounted}
                    className="hidden sm:flex items-center px-4 py-2 text-sm font-bold rounded-lg bg-[#56a963] text-[#002a0c] hover:bg-[#56a963]/90 transition-colors disabled:opacity-50"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            )}

            {/* Mobile: show avatar or connect button */}
            {!isConnected && (
              <ConnectButton.Custom>
                {({ openConnectModal, mounted }) => (
                  <button
                    onClick={openConnectModal}
                    disabled={!mounted}
                    className="sm:hidden px-3 py-1.5 text-sm font-bold rounded-lg bg-[#56a963] text-[#002a0c] hover:bg-[#56a963]/90 transition-colors disabled:opacity-50"
                  >
                    Connect
                  </button>
                )}
              </ConnectButton.Custom>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="min-[900px]:hidden p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="min-[900px]:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl">
            <nav className="flex flex-col p-4 gap-1">
              {activeLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-all min-h-[44px] flex items-center",
                    pathname === link.href
                      ? "text-white bg-[#56a963]/20 border border-[#56a963]/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Admin toggle in mobile */}
              {hasAnyAdminAccess && (
                <Link
                  href={isOnAdminPage ? "/matches" : adminEntryHref}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-all min-h-[44px] flex items-center gap-2",
                    isOnAdminPage
                      ? "text-[#56a963]/70 hover:text-[#56a963] hover:bg-[#56a963]/5"
                      : "text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/5"
                  )}
                >
                  {!isOnAdminPage && <Shield size={14} />}
                  {isOnAdminPage ? "Fan View" : "Admin Panel"}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
