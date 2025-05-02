"use client";

import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { use } from "react";

// 模拟产品数据
const getProduct = (id: string) => {
  const productId = parseInt(id);
  if (isNaN(productId) || productId < 1 || productId > 3) {
    return null;
  }

  return {
    id: productId,
    name: `产品 ${productId}`,
    description: `这是产品 ${productId} 的简要描述。这个内容显示在模态框中，通过拦截路由实现。`,
    price: 100 + productId * 50,
  };
};

export default function ProductModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 使用 React.use() 解包 params
  const resolvedParams = use(params);
  const router = useRouter();
  const product = getProduct(resolvedParams.id);

  if (!product) {
    notFound();
  }

  // 关闭模态框时返回到列表页
  const handleClose = () => {
    router.back();
  };

  // 查看完整详情
  const handleViewDetails = () => {
    // 使用 window.location 强制导航，绕过 Next.js 路由系统
    window.location.href = `/intercept-route-test/products/${product.id}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl bg-white p-0 shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()} // 防止点击内容区域关闭模态框（阻止冒泡的父容器，事件本身的逻辑还是会被执行❗）
      >
        <div className="relative">
          {/* 顶部彩色条 */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* 标题栏 */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="px-6 py-4">
          <div className="mb-4 text-lg font-semibold text-blue-600 dark:text-blue-400">
            ¥{product.price}
          </div>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {product.description}
          </p>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-between border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            关闭
          </button>
          <button
            onClick={handleViewDetails}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            查看完整详情
          </button>
        </div>
      </div>
    </div>
  );
}
