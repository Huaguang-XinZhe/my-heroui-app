"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { FaArrowLeft } from "react-icons/fa";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030712] via-[#0F172A] to-[#1E293B]">
      {/* 光效元素 */}
      <div className="pointer-events-none absolute bottom-[10%] left-[5%] z-10 h-[250px] w-[250px] rounded-full bg-purple-500/10 blur-[80px]"></div>
      <div className="pointer-events-none absolute right-[5%] top-[10%] z-10 hidden h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px] md:block"></div>

      {/* 主要内容区域 */}
      <div className="container relative z-20 mx-auto max-w-3xl px-4 py-8">
        <Card
          className="h-[98vh] border border-gray-800/50 bg-[#0A0F1A]/95 shadow-2xl shadow-indigo-500/10 ring-[0.5px] ring-indigo-500/10 backdrop-blur-sm"
          classNames={{
            body: "scrollbar-custom space-y-8 overflow-y-auto p-8",
          }}
        >
          <style jsx>{`
            :global(.scrollbar-custom::-webkit-scrollbar) {
              width: 6px;
            }
            :global(.scrollbar-custom::-webkit-scrollbar-track) {
              background: rgba(10, 15, 27, 0.3);
              border-radius: 3px;
            }
            :global(.scrollbar-custom::-webkit-scrollbar-thumb) {
              background: rgba(156, 163, 175, 0.6);
              border-radius: 3px;
            }
            :global(.scrollbar-custom::-webkit-scrollbar-thumb:hover) {
              background: rgba(156, 163, 175, 0.8);
            }
          `}</style>
          <CardHeader className="relative flex items-center justify-center border-b border-gray-800/30 px-8 py-6">
            <Button
              as={Link}
              href="/login"
              variant="ghost"
              size="sm"
              startContent={<FaArrowLeft className="h-3 w-3" />}
              className="absolute left-6 text-gray-400 transition-colors hover:text-white"
            >
              返回登录
            </Button>
            <div className="text-center">
              <h1 className="mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">
                隐私政策
              </h1>
              <p className="text-sm font-medium text-gray-400">
                生效日期：2025年6月24日
              </p>
            </div>
          </CardHeader>

          <CardBody>
            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">1.</span> 信息收集
                </h2>
                <div className="space-y-4 pl-6">
                  <h3 className="text-lg font-medium text-gray-200">
                    1.1 我们收集的信息
                  </h3>
                  <p className="leading-relaxed text-gray-300">
                    当您使用邮取星服务时，我们可能收集以下信息：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400 text-indigo-400"></span>
                      <span>
                        账户信息：Google 账户的基本信息（姓名、邮箱地址、头像）
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400 text-indigo-400"></span>
                      <span>邮箱访问权限：您授权访问的邮箱内容和附件</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400 text-indigo-400"></span>
                      <span>使用数据：访问日志、功能使用统计</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400 text-indigo-400"></span>
                      <span>设备信息：浏览器类型、IP 地址、操作系统</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">2.</span> 信息使用
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    我们使用收集的信息用于：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400 text-purple-400"></span>
                      <span>提供邮箱管理和预览服务</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400 text-purple-400"></span>
                      <span>改善用户体验和服务质量</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400 text-purple-400"></span>
                      <span>确保服务安全和防止滥用</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400 text-purple-400"></span>
                      <span>发送服务相关通知</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">3.</span> 信息保护
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    我们采取以下措施保护您的信息：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400 text-green-400"></span>
                      <span>使用 HTTPS 加密传输所有数据</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400 text-green-400"></span>
                      <span>采用行业标准的数据加密技术</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400 text-green-400"></span>
                      <span>实施严格的访问控制机制</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400 text-green-400"></span>
                      <span>定期进行安全审计和更新</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">4.</span> 信息共享
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    我们不会向第三方出售、交易或转让您的个人信息，除非：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400 text-yellow-400"></span>
                      <span>获得您的明确同意</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400 text-yellow-400"></span>
                      <span>法律法规要求</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400 text-yellow-400"></span>
                      <span>保护我们的权利和安全</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400 text-yellow-400"></span>
                      <span>与信任的服务提供商合作（如云服务商）</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">5.</span> Cookie 使用
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    我们使用 Cookie 和类似技术来：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 text-blue-400"></span>
                      <span>记住您的登录状态</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 text-blue-400"></span>
                      <span>分析网站使用情况</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 text-blue-400"></span>
                      <span>个性化用户体验</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 text-blue-400"></span>
                      <span>提供安全保护</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">6.</span> 用户权利
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">您有权：</p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400 text-cyan-400"></span>
                      <span>访问和查看我们收集的您的个人信息</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400 text-cyan-400"></span>
                      <span>要求更正不准确的信息</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400 text-cyan-400"></span>
                      <span>要求删除您的个人信息</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400 text-cyan-400"></span>
                      <span>撤回对信息处理的同意</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400 text-cyan-400"></span>
                      <span>要求限制信息处理</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">7.</span> 数据保留
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    我们仅在必要期间保留您的信息：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400 text-rose-400"></span>
                      <span>账户信息：直到您删除账户</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400 text-rose-400"></span>
                      <span>邮箱数据：根据您的设置和法律要求</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400 text-rose-400"></span>
                      <span>日志数据：通常保留 30 天</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400 text-rose-400"></span>
                      <span>备份数据：最多保留 90 天</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">8.</span> 国际传输
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    您的信息可能被传输到您所在国家/地区以外的地方进行处理。
                    我们会确保此类传输符合适用的数据保护法律。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">9.</span> 未成年人保护
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    我们的服务不面向 13 岁以下的儿童。如果我们发现收集了 13
                    岁以下儿童的个人信息，我们会立即删除此类信息。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">10.</span> 政策更新
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    我们可能不时更新本隐私政策。重要更改会通过邮件或网站通知您。
                    继续使用我们的服务即表示您同意更新后的政策。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">11.</span> 联系我们
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    如果您对本隐私政策有任何问题，请通过以下方式联系我们：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 text-emerald-400"></span>
                      <span>邮箱：2475096613@qq.com</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 text-emerald-400"></span>
                      <span>网站：www.youquxing.com</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 text-emerald-400"></span>
                      <span>地址：中国</span>
                    </li>
                  </ul>
                </div>
              </section>

              <div className="mt-8 rounded-xl border border-blue-800/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-6">
                <p className="text-sm font-medium text-blue-300">
                  <strong>最后更新时间：</strong>2025年6月24日
                </p>
                <p className="mt-2 text-sm text-blue-300">
                  本隐私政策适用于邮取星（youquxing.com）提供的所有服务。
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
