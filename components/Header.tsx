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
import Link from "next/link";
import { Logo } from "./icons/Logo";
import { IconLogin } from "./icons/icons";

export function Header() {
  const isLoggedIn = true;

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
          <HeroLink color="foreground" href="#">
            功能
          </HeroLink>
        </NavbarItem>
        <NavbarItem>
          <HeroLink color="foreground" href="#">
            服务
          </HeroLink>
        </NavbarItem>
        <NavbarItem>
          <HeroLink color="foreground" href="#">
            集成
          </HeroLink>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {isLoggedIn ? (
          <Dropdown placement="bottom-end" className="bg-dark-card">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="用户菜单" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">已登录为</p>
                <p className="font-semibold">user@example.com</p>
              </DropdownItem>
              <DropdownItem key="settings">个人设置</DropdownItem>
              <DropdownItem key="team_settings">团队设置</DropdownItem>
              <DropdownItem key="analytics">数据分析</DropdownItem>
              <DropdownItem key="system">系统管理</DropdownItem>
              <DropdownItem key="help">帮助与反馈</DropdownItem>
              <DropdownItem key="logout" color="danger">
                退出登录
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button
            as={Link}
            href="/login"
            color="primary"
            size="sm"
            startContent={<IconLogin />}
          >
            登录
          </Button>
        )}
      </NavbarContent>
    </Navbar>
  );
}
