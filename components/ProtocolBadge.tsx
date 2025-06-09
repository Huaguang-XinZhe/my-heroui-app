import { ProtocolType } from "@/types/email";

interface ProtocolBadgeProps {
  protocolType: ProtocolType;
  size?: "sm" | "md";
  className?: string;
}

export function ProtocolBadge({
  protocolType,
  size = "sm",
  className = "",
}: ProtocolBadgeProps) {
  const getProtocolConfig = (protocol: ProtocolType) => {
    switch (protocol) {
      case "GRAPH":
        return {
          text: "Graph",
          className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        };
      case "IMAP":
        return {
          text: "IMAP",
          className: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
        };
      default:
        return {
          text: "未知",
          className: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
        };
    }
  };

  const getSizeClass = (size: "sm" | "md") => {
    return size === "md" ? "text-sm px-2 py-1" : "text-xs px-1.5 py-0.5";
  };

  const config = getProtocolConfig(protocolType);
  const sizeClass = getSizeClass(size);

  return (
    <span
      className={`inline-block rounded font-medium ${config.className} ${sizeClass} ${className}`}
      title={`协议类型: ${config.text}`}
    >
      {config.text}
    </span>
  );
}
