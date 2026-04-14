import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FirstVisitTip } from "@/components/layout/FirstVisitTip";
import { CartProvider } from "@/context/CartContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FirstVisitTip />
    </CartProvider>
  );
}
