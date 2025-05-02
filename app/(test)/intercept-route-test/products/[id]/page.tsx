"use client";

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

// 模拟产品数据
const getProduct = (id: string) => {
  const productId = parseInt(id);
  if (isNaN(productId) || productId < 1 || productId > 3) {
    return null;
  }
  
  return {
    id: productId,
    name: `产品 ${productId}`,
    description: `这是产品 ${productId} 的详细描述。这个页面是完整的产品详情页面。`,
    price: 100 + productId * 50,
    features: [
      '高品质材料',
      '耐用设计',
      '现代外观',
      '多种颜色可选'
    ]
  };
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // 使用 React.use() 解包 params
  const resolvedParams = use(params);
  const product = getProduct(resolvedParams.id);
  
  if (!product) {
    notFound();
  }
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/intercept-route-test" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; 返回产品列表
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{product.name}</h1>
        <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">¥{product.price}</div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">产品特点：</h2>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
            {product.features.map((feature, index) => (
              <li key={index} className="mb-1">{feature}</li>
            ))}
          </ul>
        </div>
        
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          添加到购物车
        </button>
      </div>
    </div>
  );
}
