"use client";

import Image from "next/image";
import { t } from "@/lib/i18n/en-IN";
import { cn } from "@/lib/utils";

type PromoBanner = {
  id: string;
  href: string;
  image: string;
  alt: string;
  cardInner?: "dark" | "light";
  innerClassName?: string;
  logoClassName?: string;
};

const BANNERS: PromoBanner[] = [
  {
    id: "melbet",
    href: "https://melbet5.com/tr/block?tag=d_5416112m_2170c_",
    image: "/banners/melbet.png",
    alt: "Melbet",
    cardInner: "dark",
  },
  {
    id: "1xbet",
    href: "https://1xlite-24510.bar/tr/block?tag=s_5487951m_355c_",
    image: "/banners/1xbet.svg",
    alt: "1xBet",
    cardInner: "light",
    logoClassName: "h-full w-full object-contain",
  },
  {
    id: "22bet",
    href: "https://22betkjs.com/p/sports-general/index_en.php?btag=532847_1b5dd840003140e29980ffc956aa9432",
    image: "/banners/22bet.svg",
    alt: "22Bet",
    cardInner: "dark",
    logoClassName: "h-full w-full object-contain",
  },
];

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
            className={cn(
              "block w-full rounded-lg overflow-hidden transition-opacity hover:opacity-95",
              banner.cardInner
                ? "bg-gray-200 p-1.5"
                : "relative h-[64px] bg-black/5"
            )}
          >
            {banner.cardInner ? (
              <div
                className={cn(
                  "flex items-center justify-center rounded-md overflow-hidden",
                  banner.innerClassName ?? "h-14",
                  banner.cardInner === "dark" ? "bg-black" : "bg-white"
                )}
              >
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  width={200}
                  height={56}
                  className={
                    banner.logoClassName ??
                    "h-9 w-auto max-w-full object-contain"
                  }
                />
              </div>
            ) : (
              <div className="relative w-full h-[64px]">
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 33vw, 240px"
                />
              </div>
            )}
          </a>
          <a
            href={banner.href}
            {...linkProps}
            className="w-full py-2 text-xs font-semibold rounded-md bg-op-accent text-white hover:bg-op-header transition-colors text-center"
          >
            {t.home.claimOffer}
          </a>
        </div>
      ))}
    </div>
  );
}
