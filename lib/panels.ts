import dynamic from "next/dynamic";

// 分别动态导入每个组件
export const Panel = dynamic(
  () => import("react-resizable-panels").then((mod) => mod.Panel),
  { ssr: false },
);

export const PanelGroup = dynamic(
  () => import("react-resizable-panels").then((mod) => mod.PanelGroup),
  { ssr: false },
);

export const PanelResizeHandle = dynamic(
  () => import("react-resizable-panels").then((mod) => mod.PanelResizeHandle),
  { ssr: false },
);
