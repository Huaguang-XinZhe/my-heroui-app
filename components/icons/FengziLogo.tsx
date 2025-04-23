import Image from "next/image";
import { IconProps } from "@/types";
import clsx from "clsx";

export const FengziLogo: React.FC<IconProps> = ({ className }) => (
  <Image
    src="/fengzi-logo.png"
    alt="Fengzi"
    className={clsx("object-contain", className)}
    width={64} // 原始尺寸信息
    height={64}
  />
);
