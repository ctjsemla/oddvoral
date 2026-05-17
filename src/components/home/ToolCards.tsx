import Link from "next/link";
import { TrendingDown, Shield, Star, Radio } from "lucide-react";
import { t } from "@/lib/i18n/en-IN";

const TOOLS = [
  {
    href: "/dropping-odds",
    icon: TrendingDown,
    title: t.nav.droppingOdds,
    desc: t.tools.droppingDesc,
    color: "bg-orange-50 text-op-drop border-orange-200",
  },
  {
    href: "/sure-bets",
    icon: Shield,
    title: t.tools.sureTitle,
    desc: t.tools.sureDesc,
    color: "bg-blue-50 text-op-sure border-blue-200",
  },
  {
    href: "/value-bets",
    icon: Star,
    title: t.tools.valueTitle,
    desc: t.tools.valueDesc,
    color: "bg-purple-50 text-op-value border-purple-200",
  },
  {
    href: "/live",
    icon: Radio,
    title: t.nav.live,
    desc: "Live matches and odds",
    color: "bg-red-50 text-op-live border-red-200",
  },
];

export function ToolCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {TOOLS.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className={`flex items-start gap-3 p-4 rounded-lg border transition-all hover:shadow-md hover:-translate-y-0.5 ${tool.color}`}
        >
          <tool.icon size={22} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">{tool.title}</div>
            <div className="text-xs opacity-75 mt-0.5">{tool.desc}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
