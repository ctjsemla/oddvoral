"use client";

import Image from "next/image";
import { t } from "@/lib/i18n/en-IN";

const BANNERS = [
  {
    id: "melbet",
    href: "https://melbet5.com/tr/block?tag=d_5416112m_2170c_",
    image: "/banners/melbet.png",
    alt: "Melbet",
  },
  {
    id: "1xbet",
    href: "https://1xlite-24510.bar/tr/block?tag=s_5487951m_355c_",
    image: "/banners/1xbet.png",
    alt: "1xBet",
  },
  {
    id: "22bet",
    href: "https://22betkjs.com/p/sports-general/index_en.php?btag=532847_1b5dd840003140e29980ffc956aa9432",
    image: "/banners/22bet.png",
    alt: "22Bet",
  },
] as const;

const linkProps = {
  target: "_blank" as const,
  rel: "noopener noreferrer sponsored",
};

export function PromoBanners() {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {BANNERS.map((banner) => (
        <div key={banner.id} className="flex flex-col gap-2 min-w-0">
          <a
            href={banner.href}
            {...linkProps}
            className="block relative w-full h-[64px] rounded-md overflow-hidden bg-black/5 hover:opacity-95 transition-opacity"
          >
            <Image
              src={banner.image}
              alt={banner.alt}
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 33vw, 240px"
            />
          </a>
          <a
            href={banner.href}
            {...linkProps}
            className="w-full py-1.5 text-xs font-semibold rounded-md bg-op-accent text-white hover:bg-op-header transition-colors text-center"
          >
            {t.home.claimOffer}
          </a>
        </div>
      ))}
    </div>
  );
}
