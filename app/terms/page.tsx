"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { FaArrowLeft } from "react-icons/fa";

export default function TermsOfServicePage() {
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
                服务条款
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
                  <span className="text-indigo-400">1.</span> 服务条款的接受
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    欢迎使用邮取星（"我们"或"服务"）。通过访问或使用我们的服务，
                    您同意受本服务条款（"条款"）的约束。如果您不同意这些条款，
                    请不要使用我们的服务。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">2.</span> 服务描述
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    邮取星是一个邮箱管理和预览平台，提供以下功能：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 text-blue-400"></span>
                      <span>邮箱内容的安全预览和管理</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 text-blue-400"></span>
                      <span>多邮箱账户统一管理</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 text-blue-400"></span>
                      <span>邮件搜索和过滤功能</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 text-blue-400"></span>
                      <span>邮箱数据的安全存储和同步</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 text-blue-400"></span>
                      <span>第三方邮箱服务的集成</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">3.</span> 用户账户
                </h2>
                <div className="space-y-6 pl-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-200">
                      3.1 账户注册
                    </h3>
                    <p className="leading-relaxed text-gray-300">
                      您可以通过以下方式创建账户：
                    </p>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400 text-green-400"></span>
                        <span>Google 账户授权登录</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400 text-green-400"></span>
                        <span>卡密验证登录（体验账户）</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-200">
                      3.2 账户安全
                    </h3>
                    <p className="leading-relaxed text-gray-300">您有责任：</p>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400 text-orange-400"></span>
                        <span>保护您的账户凭证安全</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400 text-orange-400"></span>
                        <span>及时报告任何未经授权的访问</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400 text-orange-400"></span>
                        <span>确保提供的信息准确和最新</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400 text-orange-400"></span>
                        <span>不与他人共享您的账户</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">4.</span> 使用许可和限制
                </h2>
                <div className="space-y-6 pl-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-200">
                      4.1 许可使用
                    </h3>
                    <p className="leading-relaxed text-gray-300">
                      我们授予您有限的、非独占的、不可转让的许可来使用我们的服务。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-200">
                      4.2 使用限制
                    </h3>
                    <p className="leading-relaxed text-gray-300">您不得：</p>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400 text-red-400"></span>
                        <span>将服务用于非法或未经授权的目的</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400 text-red-400"></span>
                        <span>干扰或破坏服务的完整性或性能</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400 text-red-400"></span>
                        <span>尝试获得对其他用户账户的未经授权访问</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400 text-red-400"></span>
                        <span>发送垃圾邮件、恶意软件或其他有害内容</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400 text-red-400"></span>
                        <span>违反任何适用的法律法规</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400 text-red-400"></span>
                        <span>反向工程、反编译或破解我们的软件</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">5.</span> 隐私和数据保护
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    您的隐私对我们很重要。我们的数据处理实践详见我们的
                    <Link
                      href="/privacy"
                      className="mx-1 text-indigo-400 underline hover:text-indigo-300"
                    >
                      隐私政策
                    </Link>
                    。使用我们的服务即表示您同意按照隐私政策收集和使用信息。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">6.</span> 用户内容
                </h2>
                <div className="space-y-6 pl-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-200">
                      6.1 内容所有权
                    </h3>
                    <p className="leading-relaxed text-gray-300">
                      您保留对通过服务访问或存储的内容的所有权利。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-200">
                      6.2 内容责任
                    </h3>
                    <p className="leading-relaxed text-gray-300">
                      您对您的内容负责，并确保：
                    </p>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400 text-purple-400"></span>
                        <span>您有权使用和共享该内容</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400 text-purple-400"></span>
                        <span>内容不侵犯他人的权利</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400 text-purple-400"></span>
                        <span>内容不包含非法或有害材料</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">7.</span> 服务可用性
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    我们努力保持服务的可用性，但不保证：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400 text-yellow-400"></span>
                      <span>服务将不间断或无错误</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400 text-yellow-400"></span>
                      <span>所有功能在所有时间都可用</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400 text-yellow-400"></span>
                      <span>服务不会受到维护或技术问题的影响</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">8.</span> 费用和付款
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    目前我们提供：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 text-emerald-400"></span>
                      <span>免费的基础服务</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 text-emerald-400"></span>
                      <span>通过卡密获得的体验服务</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 text-emerald-400"></span>
                      <span>授权用户的完整服务</span>
                    </li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-gray-300">
                    我们保留在未来引入付费服务的权利，并将提前通知用户。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">9.</span> 知识产权
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    服务及其原创内容、功能和特性是邮取星的专有财产，
                    受国际版权、商标、专利、商业秘密和其他知识产权法律保护。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">10.</span> 免责声明
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    服务按"现状"和"可用"基础提供。我们不提供任何明示或暗示的保证，
                    包括但不限于：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400 text-rose-400"></span>
                      <span>适销性或特定用途适用性的保证</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400 text-rose-400"></span>
                      <span>服务将满足您的要求</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400 text-rose-400"></span>
                      <span>服务将不间断、及时、安全或无错误</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400 text-rose-400"></span>
                      <span>通过服务获得的结果将准确或可靠</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">11.</span> 责任限制
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    在任何情况下，我们均不对以下损失承担责任：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400 text-amber-400"></span>
                      <span>间接、偶然、特殊、后果性或惩罚性损害</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400 text-amber-400"></span>
                      <span>利润损失、数据丢失或业务中断</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400 text-amber-400"></span>
                      <span>因使用或无法使用服务而产生的任何损失</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">12.</span> 服务终止
                </h2>
                <div className="space-y-6 pl-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-200">
                      12.1 您的终止权
                    </h3>
                    <p className="leading-relaxed text-gray-300">
                      您可以随时停止使用服务并删除您的账户。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-200">
                      12.2 我们的终止权
                    </h3>
                    <p className="leading-relaxed text-gray-300">
                      我们可能在以下情况下暂停或终止您的访问权限：
                    </p>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400 text-pink-400"></span>
                        <span>违反这些条款</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400 text-pink-400"></span>
                        <span>涉嫌非法或欺诈行为</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400 text-pink-400"></span>
                        <span>长期不活跃</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400 text-pink-400"></span>
                        <span>技术或安全原因</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">13.</span> 争议解决
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    任何争议应首先通过友好协商解决。如果协商失败，
                    争议将提交至中国有管辖权的法院解决。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">14.</span> 条款修改
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    我们保留随时修改这些条款的权利。重大变更将通过邮件或
                    网站公告通知您。继续使用服务即表示接受修改后的条款。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">15.</span> 联系信息
                </h2>
                <div className="space-y-4 pl-6">
                  <p className="leading-relaxed text-gray-300">
                    如果您对这些条款有任何问题，请联系我们：
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400 text-teal-400"></span>
                      <span>邮箱：2475096613@qq.com</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400 text-teal-400"></span>
                      <span>网站：www.youquxing.com</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400 text-teal-400"></span>
                      <span>地址：中国</span>
                    </li>
                  </ul>
                </div>
              </section>

              <div className="mt-8 rounded-xl border border-green-800/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-6">
                <p className="text-sm font-medium text-green-300">
                  <strong>最后更新时间：</strong>2025年6月24日
                </p>
                <p className="mt-2 text-sm text-green-300">
                  通过使用邮取星服务，您确认已阅读、理解并同意受这些服务条款的约束。
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
