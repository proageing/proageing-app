import Image from "next/image";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/proage-logo.png"
      alt="ProAge"
      width={size}
      height={size}
      className="rounded-full"
      priority
    />
  );
}
