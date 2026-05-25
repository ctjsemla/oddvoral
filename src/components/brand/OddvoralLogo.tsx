import Image from "next/image";
import { cn } from "@/lib/utils";

interface OddvoralLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function OddvoralLogo({
  size = 40,
  className,
  priority = false,
}: OddvoralLogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Oddvoral"
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0", className)}
    />
  );
}
