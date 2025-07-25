"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import { SessionProvider } from "next-auth/react";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <SessionProvider>
      <HeroUIProvider navigate={router.push}>
        <ToastProvider
          placement="top-center"
          toastOffset={15}
          toastProps={{
            radius: "lg",
            color: "default",
            variant: "flat",
            timeout: 1500,
          }}
        />
        <NextThemesProvider {...themeProps}>
          <BackgroundProvider>{children}</BackgroundProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
}
