"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link as HeroLink } from "@heroui/link";
import {
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { showSuccessToast } from "@/utils/toast";
import {
  clearAllUserData,
  formatCardKeyDisplay,
  copyCardKeyWithToast,
} from "@/utils/utils";
import {
  saveOAuthUser,
  getOAuthUser,
  clearOAuthUser,
  OAuthUserInfo,
} from "@/utils/oauthUserStorage";
import { Logo } from "@/components/icons/Logo";
import { IconLogin } from "@/components/icons/icons";
import { ExternalLinkIcon } from "@/components/icons/ExternalLinkIcon";
import { TrialAccount } from "@/types/email";

export function Header() {
  const { data: session, status } = useSession();
  const [trialAccount, setTrialAccount] = useState<TrialAccount | null>(null);

  // 检查体验账户
  useEffect(() => {
    const trialAccountData = localStorage.getItem("trialAccount");
    if (trialAccountData) {
      try {
        setTrialAccount(JSON.parse(trialAccountData));
      } catch (error) {
        console.error("解析体验账户数据失败:", error);
      }
    }
  }, []);

  // 保存 OAuth 用户信息到本地存储
  useEffect(() => {
    if (session?.user && status === "authenticated") {
      const sessionUser = session.user as any;

      // 检查是否是 OAuth 登录
      if (sessionUser.userId) {
        let provider: "google" | "linuxdo";
        let userType: "oauth2-google" | "oauth2-linuxdo";

        // 通过 username 字段或 email 格式判断提供商
        if (sessionUser.username) {
          // 有 username 字段说明是 Linux DO 用户
          provider = "linuxdo";
          userType = "oauth2-linuxdo";
        } else {
          // 没有 username 字段说明是 Google 用户
          provider = "google";
          userType = "oauth2-google";
        }

        const oauthUserInfo: OAuthUserInfo = {
          id: sessionUser.userId,
          nickname: sessionUser.name || undefined,
          avatar_url: sessionUser.image || undefined,
          user_type: userType,
          level: sessionUser.trustLevel || undefined,
          provider,
          username: sessionUser.username || undefined,
        };

        // 检查本地是否已有该用户信息
        const existingUser = getOAuthUser();
        if (!existingUser || existingUser.id !== oauthUserInfo.id) {
          saveOAuthUser(oauthUserInfo);
        }
      }
    }
  }, [session, status]);

  // 处理体验账户退出登录
  const handleTrialLogout = () => {
    // 清除所有用户数据
    clearAllUserData();
    setTrialAccount(null);
    showSuccessToast("已退出体验账户");
    window.location.href = "/login";
  };

  // 处理卡密复制
  const handleCopyCardKey = (cardKey: string) => {
    copyCardKeyWithToast(cardKey, showSuccessToast);
  };

  // 处理邮箱复制（OAuth2 用户）
  const handleCopyEmail = (email: string) => {
    // 检查是否是 Linux DO 格式的 email (@username • level level)
    const linuxdoMatch = email.match(/^(@\w+)\s+•\s+\d+\s+level$/);

    if (linuxdoMatch) {
      // Linux DO 格式，只复制 @username 部分
      const username = linuxdoMatch[1];
      navigator.clipboard.writeText(username);
      showSuccessToast("用户名已复制", username);
    } else {
      // 普通邮箱格式
      navigator.clipboard.writeText(email);
      showSuccessToast("邮箱已复制", email);
    }
  };

  // 渲染用户头像和菜单
  const renderUserMenu = () => {
    if (status === "loading") {
      return (
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      );
    }

    if (trialAccount) {
      return (
        <div className="flex items-center gap-3">
          <Dropdown placement="bottom-end" className="bg-dark-card">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                size="sm"
                src="/default-avator.jpg"
                name="体验账户"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="体验账户菜单" variant="flat">
              <DropdownItem
                key="profile"
                className="h-14 gap-2"
                onPress={() => {
                  // 复制原始卡密
                  const originalCardKey =
                    trialAccount.cardData?.originalCardKey || "未知卡密";
                  handleCopyCardKey(originalCardKey);
                }}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">华光共享号</p>
                  <p className="text-xs text-default-400">
                    卡密:{" "}
                    {formatCardKeyDisplay(
                      trialAccount.cardData?.originalCardKey || "",
                      16,
                    )}
                  </p>
                </div>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onPress={handleTrialLogout}
              >
                退出登录
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Chip
            size="sm"
            color="success"
            variant="flat"
            className="hidden sm:flex"
          >
            体验账户
          </Chip>
        </div>
      );
    }

    if (session) {
      return (
        <div className="flex items-center gap-3">
          <Dropdown placement="bottom-end" className="bg-dark-card">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                size="sm"
                src={
                  session.user?.image
                    ? `/api/proxy-image?url=${encodeURIComponent(session.user.image)}`
                    : "/default-avator.jpg"
                }
                name={session.user?.name || session.user?.email || "用户"}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="用户菜单" variant="flat">
              <DropdownItem
                key="profile"
                className="h-14 gap-2"
                onPress={() => handleCopyEmail(session.user?.email || "")}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">
                    {session.user?.name || "用户"}
                  </p>
                  <p className="text-xs text-default-400">
                    {session.user?.email}
                  </p>
                </div>
              </DropdownItem>
              {session.user?.isAdmin ? (
                <>
                  <DropdownItem key="admin-dashboard" as={Link} href="/admin">
                    🏛️ 管理员控制台
                  </DropdownItem>
                </>
              ) : null}
              <DropdownItem
                key="batch-verify"
                as={Link}
                href="/batch-card-verify"
              >
                ✅ 批量验证
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onPress={() => {
                  // 清除所有用户数据
                  clearAllUserData();
                  clearOAuthUser();
                  // 退出登录
                  signOut({ callbackUrl: "/login" });
                }}
              >
                退出登录
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          {session.user?.isAdmin && (
            <Chip
              size="sm"
              color="warning"
              variant="flat"
              className="hidden sm:flex"
            >
              管理员
            </Chip>
          )}
        </div>
      );
    }

    return (
      <Button
        as={Link}
        href="/login"
        color="primary"
        size="sm"
        startContent={<IconLogin />}
      >
        登录
      </Button>
    );
  };

  return (
    <Navbar className="bg-dark-card">
      <NavbarContent justify="start">
        <NavbarBrand>
          <Logo className="mr-2 size-10" />
          <p className="bg-gradient-to-tr from-indigo-600 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent">
            邮取星
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        <NavbarItem>
          <span
            className="flex cursor-not-allowed items-center gap-1 text-foreground/50"
            title="正在施工中，敬请期待"
          >
            API 集成
            <span className="text-xs">🚧</span>
          </span>
        </NavbarItem>
        <NavbarItem>
          <HeroLink
            color="foreground"
            href="https://feedback.youquxing.com/zh-CN/roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
          >
            路线图
            <ExternalLinkIcon />
          </HeroLink>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">{renderUserMenu()}</NavbarContent>
    </Navbar>
  );
}
