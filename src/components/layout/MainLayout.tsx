import { Header } from "./Header";
import { Footer } from "./Footer";
import { SportSidebar } from "./SportSidebar";
import { CouponWidget } from "@/components/coupon/CouponWidget";
import type { Sport } from "@/types";

interface MainLayoutProps {
  children: React.ReactNode;
  activeSport?: Sport;
  showSidebar?: boolean;
  showCoupon?: boolean;
}

export function MainLayout({
  children,
  activeSport,
  showSidebar = true,
  showCoupon = true,
}: MainLayoutProps) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        <div className="flex gap-6">
          {showSidebar && (
            <div className="hidden md:block w-56 shrink-0">
              <SportSidebar activeSport={activeSport} />
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-4">{children}</div>
          {showCoupon && (
            <div className="hidden xl:block w-72 shrink-0">
              <div className="sticky top-24">
                <CouponWidget />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
