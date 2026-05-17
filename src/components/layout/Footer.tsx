import Link from "next/link";
import { t } from "@/lib/i18n/en-IN";

export function Footer() {
  return (
    <footer className="bg-op-header-dark text-white/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-3">{t.footer.sports}</h4>
            <ul className="space-y-1.5">
              <li><Link href="/sport/football" className="hover:text-white">Football</Link></li>
              <li><Link href="/sport/tennis" className="hover:text-white">Tennis</Link></li>
              <li><Link href="/sport/basketball" className="hover:text-white">Basketball</Link></li>
              <li><Link href="/sport/hockey" className="hover:text-white">Ice Hockey</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{t.footer.tools}</h4>
            <ul className="space-y-1.5">
              <li><Link href="/dropping-odds" className="hover:text-white">{t.nav.droppingOdds}</Link></li>
              <li><Link href="/sure-bets" className="hover:text-white">{t.nav.sureBets}</Link></li>
              <li><Link href="/value-bets" className="hover:text-white">{t.nav.valueBets}</Link></li>
              <li><Link href="/live" className="hover:text-white">{t.nav.live}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{t.footer.community}</h4>
            <ul className="space-y-1.5">
              <li><Link href="/community" className="hover:text-white">{t.community.tips}</Link></li>
              <li><Link href="/community" className="hover:text-white">{t.community.couponArchive}</Link></li>
              <li><Link href="/login" className="hover:text-white">{t.nav.login}</Link></li>
              <li><Link href="/register" className="hover:text-white">{t.nav.register}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{t.footer.about}</h4>
            <p className="text-xs leading-relaxed">{t.footer.aboutText}</p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-xs text-center">
          © {new Date().getFullYear()} {t.siteName} — Odds Comparison Platform. {t.footer.responsible}
        </div>
      </div>
    </footer>
  );
}
