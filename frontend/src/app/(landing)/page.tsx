import Image from "next/image";
import Link from "next/link";
import {
  Ticket,
  ShieldCheck,
  Store,
  QrCode,
  ArrowRight,
  Lock,
  RefreshCcw,
  Wallet,
} from "lucide-react";

const FEATURES = [
  {
    icon: Ticket,
    title: "Soulbound NFT Tickets",
    description:
      "Non-transferable tickets tied to your wallet. No scalping, no fraud — just fair access for real fans.",
  },
  {
    icon: QrCode,
    title: "Dynamic QR Entry",
    description:
      "Cryptographically signed QR codes that refresh every 60 seconds. Impossible to screenshot or share.",
  },
  {
    icon: Store,
    title: "Stadium Shops",
    description:
      "Pre-order food, merch, and drinks before you arrive. Everything linked to your ticket for easy collection.",
  },
  {
    icon: ShieldCheck,
    title: "Delegate Access",
    description:
      "Can't make it? Delegate your ticket to a friend's wallet. They get entry access with their own QR code.",
  },
  {
    icon: Lock,
    title: "Transparent Treasury",
    description:
      "Every WIRE flows through an on-chain vault. Full visibility into ticket revenue, shop earnings, and platform fees.",
  },
  {
    icon: RefreshCcw,
    title: "Fair Refunds",
    description:
      "Instant refund on returns and cancellations. Shop orders linked to returned tickets auto-refund too.",
  },
];

const STATS = [
  { value: "5", label: "Smart Contracts" },
  { value: "100%", label: "On-Chain" },
  { value: "0%", label: "Scalping" },
  { value: "60s", label: "QR Refresh" },
];

const STEPS = [
  {
    step: "01",
    icon: Wallet,
    title: "Connect & Browse",
    desc: "Connect your wallet and browse upcoming cricket matches. Pick your seats from an interactive seat map.",
  },
  {
    step: "02",
    icon: Ticket,
    title: "Buy & Prepare",
    desc: "Purchase soulbound NFT tickets. Pre-order from stadium shops. Set a delegate if you want.",
  },
  {
    step: "03",
    icon: QrCode,
    title: "Scan & Enjoy",
    desc: "Show your dynamic QR code at the gate. Collect your pre-orders. Enjoy the match!",
  },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(86,169,99,0.05)_0%,_transparent_70%)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#56a963]/5 rounded-full blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="relative h-28 w-28 sm:h-36 sm:w-36">
              <Image
                src="/branding/logo-transparent.png"
                alt="WicketChain"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(86,169,99,0.3)]"
                priority
              />
            </div>
          </div>

          {/* Heading */}
          <h1
            className="font-heading text-4xl min-[375px]:text-5xl sm:text-6xl lg:text-8xl xl:text-[96px] font-bold tracking-tight animate-fade-in-up leading-[1.05]"
            style={{ animationDelay: "0.1s" }}
          >
            The Future of
            <br />
            <span className="text-gradient">Cricket Ticketing</span>
          </h1>

          <p
            className="mt-6 text-base sm:text-lg lg:text-xl text-[#ababab] max-w-2xl mx-auto leading-relaxed animate-fade-in-up font-normal"
            style={{ animationDelay: "0.2s" }}
          >
            Soulbound NFT tickets, dynamic QR verification, stadium shops, and a
            transparent on-chain treasury. Built for fans, powered by blockchain.
          </p>

          {/* CTAs */}
          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/matches"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#56a963] to-[#4a9456] hover:from-[#4a9456] hover:to-[#3e8349] text-white font-semibold px-8 py-3.5 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(86,169,99,0.3)] min-h-[48px]"
            >
              Browse Matches
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/shops"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#484848] text-white/80 hover:text-white hover:border-white/20 font-medium px-8 py-3.5 rounded-2xl transition-all duration-300 hover:bg-white/5 min-h-[48px]"
            >
              Explore Shops
            </Link>
          </div>

          {/* Stats */}
          <div
            className="mt-20 pt-8 border-t border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#56a963] font-heading">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-[#ababab] mt-1.5 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#131313] to-transparent" />
      </section>

      {/* ── How It Works ── */}
      <section className="relative py-20 sm:py-28 lg:py-32 bg-[#131313]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#56a963]/20 bg-[#56a963]/5 text-[#56a963] text-sm font-medium mb-6">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">
              Seamless Journey to the Stadium
            </h2>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="group relative p-6 sm:p-8 rounded-2xl border border-white/[0.05] bg-[rgba(31,31,31,0.4)] backdrop-blur-sm hover:border-[#56a963]/20 transition-all duration-300 overflow-hidden"
              >
                {/* Large faded step number */}
                <div className="absolute -bottom-4 -right-2 text-[128px] font-bold text-white/[0.03] font-heading leading-none select-none pointer-events-none">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-[#56a963]/10 flex items-center justify-center mb-5">
                    <item.icon size={22} className="text-[#56a963]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-heading mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#ababab] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="relative py-20 sm:py-28 lg:py-32 bg-[#0e0e0e]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">
              Platform Features
            </h2>
            <p className="mt-4 text-[#ababab] max-w-xl mx-auto text-base sm:text-lg">
              Every feature designed to eliminate fraud, enhance the fan
              experience, and bring transparency to cricket matches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 sm:p-8 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#56a963]/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#262626] flex items-center justify-center mb-5 group-hover:bg-[#56a963]/20 transition-colors">
                  <feature.icon size={22} className="text-[#56a963]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-heading mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#ababab] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative py-20 sm:py-28 lg:py-32 bg-[#0e0e0e] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(86,169,99,0.06)_0%,_transparent_60%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#56a963]/5 rounded-full blur-[150px]" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl min-[375px]:text-4xl sm:text-5xl lg:text-6xl font-bold font-heading mb-6 leading-tight">
            Ready for Match Day?
          </h2>
          <p className="text-[#ababab] mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
            Connect your wallet, grab your tickets, and experience cricket like
            never before. No middlemen, no scalpers, just you and the game.
          </p>
          <Link
            href="/matches"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#56a963] to-[#4a9456] hover:from-[#4a9456] hover:to-[#3e8349] text-white font-semibold px-10 py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(86,169,99,0.3)] text-lg min-h-[48px]"
          >
            Get Started
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
