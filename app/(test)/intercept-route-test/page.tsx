import Link from 'next/link';

export default function InterceptRouteTest() {
  return (
    <div className="p-8 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Next.js 拦截路由演示</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">什么是拦截路由？</h2>
        <p className="mb-2 text-gray-700 dark:text-gray-300">拦截路由允许你在不离开当前页面的情况下显示新内容（如模态框）。</p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">点击下面的产品查看演示效果：</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((id) => (
          <Link 
            href={`/intercept-route-test/products/${id}`}
            key={id}
            className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">产品 {id}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">点击查看详情</p>
          </Link>
        ))}
      </div>
    </div>
  );
}