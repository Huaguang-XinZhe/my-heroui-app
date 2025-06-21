"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

export default function CryptoDemoPage() {
  const [plaintext, setPlaintext] = useState("Hello");
  const [key, setKey] = useState("Key");
  const [encrypted, setEncrypted] = useState("");
  const [decrypted, setDecrypted] = useState("");

  // 创建简单校验和
  function createChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0").substring(0, 4);
  }

  // XOR 加密/解密
  function xorCrypt(text: string, key: string): string {
    const result: string[] = [];
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const xorResult = textChar ^ keyChar;
      result.push(String.fromCharCode(xorResult));
    }
    return result.join("");
  }

  // 字符详细分析
  function getCharAnalysis(text: string, key: string) {
    const analysis = [];
    for (let i = 0; i < Math.min(text.length, 10); i++) {
      // 最多显示10个字符
      const textChar = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const xorResult = textChar ^ keyChar;

      analysis.push({
        char: text[i],
        ascii: textChar,
        binary: textChar.toString(2).padStart(8, "0"),
        keyChar: key[i % key.length],
        keyAscii: keyChar,
        keyBinary: keyChar.toString(2).padStart(8, "0"),
        xorResult: xorResult,
        xorBinary: xorResult.toString(2).padStart(8, "0"),
        resultChar: String.fromCharCode(xorResult),
      });
    }
    return analysis;
  }

  const handleEncrypt = () => {
    const encryptedText = xorCrypt(plaintext, key);
    setEncrypted(encryptedText);

    // 自动解密验证
    const decryptedText = xorCrypt(encryptedText, key);
    setDecrypted(decryptedText);
  };

  const checksumDemo = createChecksum(plaintext);
  const modifiedChecksum = createChecksum(plaintext + "X"); // 模拟篡改
  const analysis = plaintext && key ? getCharAnalysis(plaintext, key) : [];

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
        <h1 className="mb-8 text-center text-3xl font-bold">🔐 加密原理演示</h1>

        {/* 输入区域 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="明文"
            value={plaintext}
            onValueChange={setPlaintext}
            placeholder="请输入要加密的文本"
          />
          <Input
            label="密钥"
            value={key}
            onValueChange={setKey}
            placeholder="请输入密钥"
          />
        </div>

        <Button onPress={handleEncrypt} color="primary" className="w-full">
          执行 XOR 加密/解密
        </Button>

        {/* 校验和演示 */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">📋 校验和演示</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">原始数据校验和</p>
                <div className="rounded bg-gray-100 p-3 font-mono dark:bg-gray-800">
                  数据: "{plaintext}" → 校验和:{" "}
                  <span className="text-success">{checksumDemo}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">篡改后校验和</p>
                <div className="rounded bg-gray-100 p-3 font-mono dark:bg-gray-800">
                  数据: "{plaintext}X" → 校验和:{" "}
                  <span className="text-danger">{modifiedChecksum}</span>
                </div>
              </div>
            </div>
            <Chip color="primary" variant="flat">
              💡 校验和不同说明数据被篡改了！
            </Chip>
          </CardBody>
        </Card>

        {/* XOR 加密结果 */}
        {encrypted && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">🔄 XOR 加密结果</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-600">原文</p>
                  <div className="break-all rounded bg-blue-50 p-3 font-mono dark:bg-blue-900/20">
                    {plaintext}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">密文</p>
                  <div className="break-all rounded bg-red-50 p-3 font-mono dark:bg-red-900/20">
                    {encrypted.split("").map((char, i) => (
                      <span key={i} title={`ASCII: ${char.charCodeAt(0)}`}>
                        {char.charCodeAt(0) < 32 || char.charCodeAt(0) > 126
                          ? `[${char.charCodeAt(0)}]`
                          : char}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600">解密后</p>
                  <div className="break-all rounded bg-green-50 p-3 font-mono dark:bg-green-900/20">
                    {decrypted}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Chip
                  color={plaintext === decrypted ? "success" : "danger"}
                  variant="flat"
                >
                  {plaintext === decrypted ? "✅ 解密成功！" : "❌ 解密失败！"}
                </Chip>
              </div>
            </CardBody>
          </Card>
        )}

        {/* XOR 详细分析 */}
        {analysis.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">🔬 XOR 运算详细分析</h2>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">字符</th>
                      <th className="p-2 text-left">ASCII</th>
                      <th className="p-2 text-left">二进制</th>
                      <th className="p-2 text-left">密钥字符</th>
                      <th className="p-2 text-left">密钥ASCII</th>
                      <th className="p-2 text-left">密钥二进制</th>
                      <th className="p-2 text-left">XOR结果</th>
                      <th className="p-2 text-left">结果二进制</th>
                      <th className="p-2 text-left">结果字符</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="bg-blue-50 p-2 font-mono dark:bg-blue-900/20">
                          {item.char}
                        </td>
                        <td className="p-2 font-mono">{item.ascii}</td>
                        <td className="p-2 font-mono text-blue-600">
                          {item.binary}
                        </td>
                        <td className="bg-yellow-50 p-2 font-mono dark:bg-yellow-900/20">
                          {item.keyChar}
                        </td>
                        <td className="p-2 font-mono">{item.keyAscii}</td>
                        <td className="p-2 font-mono text-yellow-600">
                          {item.keyBinary}
                        </td>
                        <td className="p-2 font-mono">{item.xorResult}</td>
                        <td className="p-2 font-mono text-red-600">
                          {item.xorBinary}
                        </td>
                        <td className="bg-red-50 p-2 font-mono dark:bg-red-900/20">
                          {item.xorResult < 32 || item.xorResult > 126
                            ? `[${item.xorResult}]`
                            : item.resultChar}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded bg-gray-50 p-4 dark:bg-gray-800">
                <h3 className="mb-2 font-semibold">🧮 XOR 运算规则：</h3>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm md:grid-cols-4">
                  <div>0 ⊕ 0 = 0</div>
                  <div>0 ⊕ 1 = 1</div>
                  <div>1 ⊕ 0 = 1</div>
                  <div>1 ⊕ 1 = 0</div>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  💡 关键特性：A ⊕ B ⊕ B =
                  A（这就是为什么同样的操作既能加密也能解密）
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* 算法解释 */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">📚 原理总结</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">🔍 校验和作用</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">1.</span>
                    <span>
                      <strong>防篡改：</strong>数据被修改后校验和会改变
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">2.</span>
                    <span>
                      <strong>快速检测：</strong>不用解密就能验证完整性
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">3.</span>
                    <span>
                      <strong>错误发现：</strong>传输错误也能被检测
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">🔄 XOR 加密特点</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">1.</span>
                    <span>
                      <strong>对称性：</strong>加密和解密用同样的操作
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">2.</span>
                    <span>
                      <strong>可逆性：</strong>A ⊕ B ⊕ B = A
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">3.</span>
                    <span>
                      <strong>高效性：</strong>计算速度非常快
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
