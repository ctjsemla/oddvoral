export type PromoBannerId = "melbet" | "1xbet" | "22bet";

export interface PromoBannerConfig {
  id: PromoBannerId;
  href: string;
  image: string;
  alt: string;
  cardInner?: "dark" | "light";
  innerClassName?: string;
  logoClassName?: string;
  /** Share of total promo clicks (must sum to 1 across banners). */
  clickShare: number;
}

export const PROMO_BANNERS: PromoBannerConfig[] = [
  {
    id: "melbet",
    href: "https://melbet5.com/tr/block?tag=d_5416112m_2170c_",
    image: "/banners/melbet.png",
    alt: "Melbet",
    cardInner: "dark",
    clickShare: 0.38,
  },
  {
    id: "1xbet",
    href: "https://1xlite-24510.bar/tr/block?tag=s_5487951m_355c_",
    image: "/banners/1xbet.svg",
    alt: "1xBet",
    cardInner: "light",
    logoClassName: "h-full w-full object-contain",
    clickShare: 0.34,
  },
  {
    id: "22bet",
    href: "https://22betkjs.com/p/sports-general/index_en.php?btag=532847_1b5dd840003140e29980ffc956aa9432",
    image: "/banners/22bet.svg",
    alt: "22Bet",
    cardInner: "dark",
    logoClassName: "h-full w-full object-contain",
    clickShare: 0.28,
  },
];

/** Default partner-outbound CTR vs site visits (~22K clicks per 1M visits). */
export const PROMO_CTR_DEFAULT = 0.022;
