"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Form } from "@heroui/form";
import { Spinner } from "@heroui/spinner";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaKey, FaInfoCircle } from "react-icons/fa";
import { signIn } from "next-auth/react";
// 邀请相关函数现在全部通过服务端 API 调用
import { InviteData } from "@/utils/inviteUtils";
import { Logo } from "@/components/icons/Logo";
import { SpinnerIcon } from "@/components/icons/SpinnerIcon";
import { DividerWithText } from "@/components/ui/DividerWithText";
import { AuthButton } from "@/components/auth/AuthButton";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { addEmailsToCache } from "@/cache/emailCache";
import { IconX, IconWarning } from "@/components/icons/icons";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const rawToken = params.token as string;

  // 尝试多种解码方式以确保兼容性
  let token = rawToken;
  if (rawToken) {
    try {
      // 首先尝试 decodeURIComponent
      token = decodeURIComponent(rawToken);
    } catch {
      // 如果失败，尝试简单的 unescape
      try {
        token = unescape(rawToken);
      } catch {
        // 如果都失败，使用原始令牌
        token = rawToken;
      }
    }
  }

  console.log("Token 处理:", {
    rawToken: rawToken?.substring(0, 50),
    decodedToken: token?.substring(0, 50),
  });

  // console.log("邀请页面 - 原始令牌:", rawToken);
  // console.log("邀请页面 - 解码后令牌:", token);

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardKey, setCardKey] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [hasTriedAutoCreate, setHasTriedAutoCreate] = useState(false);

  // 自动创建体验账户
  const handleAutoCreateTrialAccount = async (data: InviteData) => {
    setIsProcessing(true);

    try {
      // 调用后端 API 创建体验账户
      const response = await fetch("/api/card/create-trial-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteToken: token,
          imapEmailCount: data.imapEmailCount,
          graphEmailCount: data.graphEmailCount,
          allowBatchAddEmails: data.allowBatchAddEmails,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 使用邀请令牌
        const useResponse = await fetch("/api/admin/invite/use", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            userId: result.cardKey,
            registrationMethod: "auto_trial",
          }),
        });

        const useResult = await useResponse.json();

        if (!useResult.success) {
          setInviteError(useResult.error || "使用邀请失败");
          setIsProcessing(false);
          return;
        }

        // 将分配的邮箱添加到缓存
        if (result.allocatedEmails && result.allocatedEmails.length > 0) {
          const cacheEmails = result.allocatedEmails.map((account: any) => ({
            email: account.email,
            refreshToken: account.refreshToken || account.refresh_token,
            protocolType: account.protocolType || account.protocol_type,
            serviceProvider:
              account.serviceProvider || account.service_provider,
            clientId: account.clientId || account.client_id,
            password: account.password,
            user_id: result.cardKey,
          }));

          addEmailsToCache(cacheEmails);
        }

        // 存储体验账户数据到 localStorage
        const trialAccountData = {
          accountId: result.cardKey,
          cardKey: result.cardKey,
          cardData: {
            ...result.cardData,
            originalCardKey: result.cardKey, // 添加原始卡密
          },
          imapEmails: data.imapEmailCount,
          graphEmails: data.graphEmailCount,
          allowBatchAddEmails: data.allowBatchAddEmails,
          inviteToken: token,
          createdAt: Date.now(),
          isTrialAccount: true,
          allocatedEmailsCount: result.allocatedEmails?.length || 0,
        };

        localStorage.setItem("trialAccount", JSON.stringify(trialAccountData));

        showSuccessToast("已为您创建体验账户，正在跳转...");

        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        console.error("创建体验账户 API 返回失败:", result);
        setInviteError(result.error || "创建体验账户失败");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("创建体验账户失败:", error);
      setInviteError("创建体验账户失败，请重试");
      setIsProcessing(false);
    }
  };

  // 验证邀请链接并处理自动创建账户
  useEffect(() => {
    if (!token) return;

    // 调用服务端 API 验证邀请令牌
    const verifyInviteTokenAsync = async () => {
      try {
        console.log("客户端请求服务端验证邀请令牌");

        const response = await fetch("/api/admin/invite/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const verifyResult = await response.json();

        if (!verifyResult.success) {
          console.error("服务端验证失败:", verifyResult.error);
          setInviteError(verifyResult.error || "邀请链接验证失败");
          return;
        }

        const result = verifyResult.result;

        if (!result.isValid || !result.canUse) {
          console.error("邀请令牌验证失败:", result.error);
          setInviteError(result.error || "邀请链接无效");
          return;
        }

        setInviteData(result.data!);

        // 如果设置了自动创建体验账户且用户未登录，且还没有尝试过自动创建
        if (
          result.data!.autoCreateTrialAccount &&
          !session &&
          !hasTriedAutoCreate &&
          !isProcessing
        ) {
          // 检查是否已经创建过体验账户
          const existingAccount = localStorage.getItem("trialAccount");
          if (!existingAccount) {
            console.log("开始自动创建体验账户");
            setHasTriedAutoCreate(true);
            handleAutoCreateTrialAccount(result.data!);
          } else {
            console.log("已存在体验账户，跳过自动创建");
          }
        }
      } catch (error) {
        console.error("验证邀请令牌时发生错误:", error);
        setInviteError("验证邀请链接时发生错误，请重试");
      }
    };

    verifyInviteTokenAsync();
  }, [token]); // 移除 session 依赖，避免重复触发

  // 卡密登录处理
  const handleCardKeySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cardKey.trim()) {
      showErrorToast("请输入卡密");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/card/invite-cardkey-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardKey: cardKey.trim(),
          inviteToken: token,
        }),
      });

      const result = await response.json();

      if (result.success && result.accountData) {
        // 使用邀请令牌
        const useResponse = await fetch("/api/admin/invite/use", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            userId: result.accountData.accountId,
            registrationMethod: "cardkey",
          }),
        });

        const useResult = await useResponse.json();

        if (useResult.success) {
          showSuccessToast("卡密验证成功！正在为您登录...");

          // 添加邮箱到缓存
          if (result.cacheEmailInfo) {
            addEmailsToCache([result.cacheEmailInfo]);
          }

          // 如果有分配的邮箱，添加到缓存
          if (result.allocatedEmails && result.allocatedEmails.length > 0) {
            const cacheEmails = result.allocatedEmails.map((account: any) => ({
              email: account.email,
              refreshToken: account.refreshToken || account.refresh_token,
              protocolType: account.protocolType || account.protocol_type,
              serviceProvider:
                account.serviceProvider || account.service_provider,
              clientId: account.clientId || account.client_id,
              password: account.password,
              user_id: result.accountData.accountId,
            }));

            addEmailsToCache(cacheEmails);
          }

          // 存储账户信息
          localStorage.setItem(
            "trialAccount",
            JSON.stringify({
              ...result.accountData,
              cardData: result.userSession.cardData,
              inviteToken: token,
              isTrialAccount: true,
              allocatedEmailsCount: result.allocatedEmails?.length || 0,
            }),
          );

          router.push("/");
        } else {
          showErrorToast(useResult.error || "使用邀请失败");
        }
      } else {
        showErrorToast(result.error || "卡密验证失败");
      }
    } catch (error) {
      console.error("卡密验证失败:", error);
      showErrorToast("网络错误，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

  // OAuth 登录处理
  const handleOAuthSignIn = (provider: "google" | "linuxdo") => {
    // 在 OAuth 登录时将邀请令牌保存到 sessionStorage
    sessionStorage.setItem("inviteToken", token);
    // 通过回调 URL 传递邀请令牌，以便 NextAuth 可以访问
    const callbackUrl = `/?inviteToken=${encodeURIComponent(token)}`;
    signIn(provider, { callbackUrl });
  };

  // 如果正在处理自动创建体验账户
  if (isProcessing && inviteData?.autoCreateTrialAccount) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md"
      >
        <Card className="rounded-2xl bg-[#0A0F1A] shadow-2xl shadow-green-500/10 ring-[0.5px] ring-green-500/10">
          <CardBody className="flex flex-col items-center gap-4 p-8 text-center">
            <Spinner size="lg" color="success" />
            <h2 className="text-2xl font-bold text-white">正在创建体验账户</h2>
            <p className="text-gray-400">正在为您自动配置邮箱服务，请稍候...</p>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  // 如果邀请无效或有错误
  if (inviteError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md"
      >
        <Card className="rounded-2xl bg-[#0A0F1A] shadow-2xl shadow-red-500/10 ring-[0.5px] ring-red-500/10">
          <CardBody className="flex flex-col items-center gap-4 p-8 text-center">
            <IconX className="h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-white">邀请无效</h2>
            <p className="text-gray-400">{inviteError}</p>
            <Button
              onPress={() => router.push("/login")}
              color="primary"
              variant="flat"
            >
              返回登录页面
            </Button>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  // 如果还在加载
  if (!inviteData) {
    return (
      <div className="flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // 检查可用的登录方式
  const availableMethods = [];
  if (inviteData.registrationMethods.google) availableMethods.push("google");
  if (inviteData.registrationMethods.linuxdo) availableMethods.push("linuxdo");
  if (inviteData.registrationMethods.cardKey) availableMethods.push("cardKey");

  // 检查是否有卡密注册
  const hasCardKey = inviteData.registrationMethods.cardKey;
  // 计算OAuth按钮数量
  const oauthMethods = [];
  if (inviteData.registrationMethods.google) oauthMethods.push("google");
  if (inviteData.registrationMethods.linuxdo) oauthMethods.push("linuxdo");

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className={hasCardKey ? "max-w-md" : "max-w-lg"}
    >
      <Card
        className={`rounded-2xl bg-[#0A0F1A] ${
          hasCardKey ? "" : "py-5"
        } shadow-2xl shadow-indigo-500/10 ring-[0.5px] ring-indigo-500/10 hover:shadow-indigo-500/30`}
      >
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <Logo className="mb-2 mt-4 size-16" />
          <h1 className="text-3xl font-extrabold text-white">受邀注册</h1>
          <p className="text-sm text-gray-400">
            使用邀请链接注册 <strong className="text-indigo-400">邮取星</strong>{" "}
            账号
          </p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="rounded bg-blue-500/20 px-2 py-1 text-blue-300">
              IMAP: {inviteData.imapEmailCount}
            </span>
            <span className="rounded bg-purple-500/20 px-2 py-1 text-purple-300">
              GRAPH: {inviteData.graphEmailCount}
            </span>
          </div>
        </CardHeader>

        <CardBody className="space-y-6 px-6 pt-6">
          {availableMethods.length === 0 ? (
            <div className="text-center">
              <IconWarning className="mx-auto mb-4 h-12 w-12 text-orange-500" />
              <h3 className="mb-2 text-lg font-semibold text-white">
                暂无可用注册方式
              </h3>
              <p className="text-sm text-gray-400">
                此邀请链接未开放任何注册方式
              </p>
            </div>
          ) : (
            <>
              {/* 卡密登录 */}
              {inviteData.registrationMethods.cardKey && (
                <Form onSubmit={handleCardKeySubmit} className="space-y-4">
                  <Input
                    isClearable
                    onClear={() => setCardKey("")}
                    placeholder="请输入卡密"
                    value={cardKey}
                    onChange={(e) => setCardKey(e.target.value)}
                    size="lg"
                    radius="lg"
                    startContent={
                      <div className="pointer-events-none flex items-center text-indigo-500">
                        <FaKey className="h-4 w-4" />
                      </div>
                    }
                    classNames={{
                      input: "ml-1",
                      inputWrapper: [
                        "bg-gray-900",
                        "group-hover:bg-gray-875",
                        "group-data-[focus=true]:bg-gray-900",
                      ],
                    }}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    radius="lg"
                    color="primary"
                    isLoading={isProcessing}
                    spinner={<SpinnerIcon className="h-5 w-5 animate-spin" />}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 font-medium transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span className="inline-flex items-center">
                      {isProcessing ? "验证中..." : "验证并注册"}
                    </span>
                  </Button>

                  <div className="flex rounded-lg border-l-4 border-indigo-500 bg-indigo-900/20 p-4">
                    <FaInfoCircle className="mt-0.5 w-8 text-indigo-400" />
                    <p className="ml-2 text-sm font-medium text-indigo-300">
                      卡密可重复使用，首次使用时将自动分配邮箱账户。请务必妥善保存，这是卡密登录的唯一凭证！
                    </p>
                  </div>
                </Form>
              )}

              {/* 分隔线 */}
              {inviteData.registrationMethods.cardKey &&
                (availableMethods.includes("google") ||
                  availableMethods.includes("linuxdo")) && (
                  <DividerWithText>或者</DividerWithText>
                )}

              {/* OAuth 登录选项 */}
              {(inviteData.registrationMethods.google ||
                inviteData.registrationMethods.linuxdo) && (
                <div
                  className={`grid gap-4 ${oauthMethods.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                >
                  {inviteData.registrationMethods.linuxdo && (
                    <AuthButton
                      className={`${oauthMethods.length === 1 ? "mx-4" : ""}`}
                      icon={
                        <img
                          src="/linuxdo-logo.png"
                          alt="Linux DO"
                          className="h-5 w-5"
                        />
                      }
                      text="LinuxDO 授权"
                      onPress={() => handleOAuthSignIn("linuxdo")}
                    />
                  )}

                  {inviteData.registrationMethods.google && (
                    <AuthButton
                      className={`${oauthMethods.length === 1 ? "mx-4" : ""}`}
                      icon={<FcGoogle />}
                      text="谷歌授权"
                      onPress={() => handleOAuthSignIn("google")}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {/* 底部信息 */}
          <div className="mt-4 text-center">
            <p className="mb-6 text-sm text-gray-500">
              注册后您将获得 {inviteData.imapEmailCount} 个 IMAP 邮箱
              {inviteData.graphEmailCount > 0 && (
                <> 和 {inviteData.graphEmailCount} 个 GRAPH 邮箱</>
              )}
            </p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
