import { Card, CardBody, CardHeader } from "@heroui/card";

// export default function Page() {
//   return (
//     <Card
//       // isHoverable // 核心是这个，指定了这个就会使用默认的 hover，然后让自定义的 hover 失效❗
//       className="p-4 hover:bg-indigo-100" // 直接加在这里也行❗
//       //   classNames={{
//       //     base: "hover:bg-indigo-100 transition-colors duration-300",
//       //   }}
//       //   classNames={{
//       //     base: "hover:bg-indigo-100", // 加不加过渡动画都可以❗
//       //   }}
//     >
//       <CardHeader>标题</CardHeader>
//       <CardBody>内容</CardBody>
//     </Card>
//   );
// }

// 强行改变 Card 的竖向布局（改为横向）
export default function Page() {
  return (
    <Card
      isHoverable
      className="w-full max-w-xl flex-row items-center p-4 transition-colors duration-300"
    >
      <CardHeader className="w-1/3 p-2">
        <img
          src="https://picsum.photos/200"
          alt="示例图片"
          className="h-auto w-full rounded-lg object-cover"
        />
      </CardHeader>
      <CardBody className="w-2/3 p-4">
        <h4 className="text-lg font-semibold">横向卡片标题</h4>
        <p className="mt-2 text-sm text-gray-600">
          这是一个演示如何让 HeroUI 卡片横向布局的例子。
        </p>
      </CardBody>
    </Card>
  );
}
