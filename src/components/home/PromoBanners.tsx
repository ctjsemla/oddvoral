"use client";

import { PROMO_BANNERS } from "@/data/promo-banners";
import { useAdminStore } from "@/store/adminStore";
import { t } from "@/lib/i18n/en-IN";
import { cn } from "@/lib/utils";
import Image from "next/image";

const linkProps = {
  target: "_blank" as const,
  rel: "noopener noreferrer sponsored",
};

export function PromoBanners() {
  const trackBannerClick = useAdminStore((s) => s.trackBannerClick);

  const onClick = (id: (typeof PROMO_BANNERS)[number]["id"], source: "logo" | "claim") => {
    trackBannerClick(id, source);
  };

  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {PROMO_BANNERS.map((banner) => (
        <div key={banner.id} className="flex flex-col gap-2 min-w-0">
          <a
            href={banner.href}
            {...linkProps}
            onClick={() => onClick(banner.id, "logo")}
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
            onClick={() => onClick(banner.id, "claim")}
            className="w-full py-2 text-xs font-semibold rounded-md bg-op-accent text-white hover:bg-op-header transition-colors text-center"
          >
            {t.home.claimOffer}
          </a>
        </div>
      ))}
    </div>
  );
}
