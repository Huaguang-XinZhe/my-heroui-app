import { Snippet } from "@heroui/snippet";
import { IconClock } from "@/components/icons/icons";

interface EmailContentVerificationProps {
  code: string;
  expiryMinutes?: number;
}

export function EmailContentVerification({
  code,
  expiryMinutes,
}: EmailContentVerificationProps) {
  return (
    <div className="mt-20 flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-col justify-center">
        <Snippet
          hideSymbol
          variant="flat"
          size="lg"
          className="bg-dark-hover py-4 pl-4 pr-3 font-mono text-3xl tracking-wider sm:py-6 sm:pl-6 sm:pr-4 sm:text-5xl"
          tooltipProps={{
            content: "复制验证码",
            showArrow: true,
            offset: 5,
          }}
        >
          {code}
        </Snippet>

        {/* 验证码有效期 */}
        <div className="mt-3 flex items-center justify-center text-xs text-gray-400 sm:mt-4 sm:text-sm">
          <IconClock className="mr-1.5 text-indigo-400 sm:mr-2" />
          {`${expiryMinutes || "-"} 分钟内有效`}
        </div>
      </div>
    </div>
  );
}
