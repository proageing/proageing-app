import Image from "next/image";

export function Logo({ size = 40, className = "rounded-full" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/proage-logo.png"
      alt="ProAge"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
