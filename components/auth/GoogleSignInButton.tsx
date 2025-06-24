"use client";

import { Button } from "@heroui/button";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

interface GoogleSignInButtonProps {
  callbackUrl?: string;
}

export function GoogleSignInButton({
  callbackUrl = "/",
}: GoogleSignInButtonProps) {
  const handleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <Button
      onPress={handleSignIn}
      variant="bordered"
      startContent={<FcGoogle className="text-xl" />}
      className="w-full"
      size="lg"
    >
      使用谷歌账号登录
    </Button>
  );
}
