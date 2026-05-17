import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface UserAvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  verified?: boolean;
  pro?: boolean;
}

const SIZES = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" };

export function UserAvatar({
  name,
  color,
  size = "md",
  verified,
  pro,
}: UserAvatarProps) {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="relative inline-flex shrink-0">
      <span
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white",
          SIZES[size]
        )}
        style={{ backgroundColor: color }}
      >
        {initials}
      </span>
      {verified && (
        <CheckCircle
          size={size === "sm" ? 12 : 14}
          className="absolute -bottom-0.5 -right-0.5 text-blue-500 fill-white"
        />
      )}
      {pro && (
        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1 rounded">
          PRO
        </span>
      )}
    </div>
  );
}
