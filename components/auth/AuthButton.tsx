import { ReactNode } from "react";
import { Button } from "@heroui/button";

interface AuthButtonProps {
  icon: ReactNode;
  text: string;
  onPress?: () => void;
}

export function AuthButton({ icon, text, onPress }: AuthButtonProps) {
  return (
    <Button
      variant="bordered"
      className="flex items-center justify-center border-gray-800 py-3 font-medium text-gray-300 transition-transform duration-300 hover:-translate-y-0.5 hover:border-indigo-700 hover:text-indigo-400 hover:shadow-md hover:shadow-indigo-500/10"
      radius="lg"
      onPress={onPress}
    >
      <div className="flex h-5 w-5 items-center justify-center text-lg transition-transform group-hover:scale-110">
        {icon}
      </div>
      <span className="font-medium">{text}</span>
    </Button>
  );
}
