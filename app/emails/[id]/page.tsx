"use client";

import { use } from "react";
import { EmailSourceView } from "@/components/EmailSourceView";
import { Panel, PanelGroup, PanelResizeHandle } from "@/lib/panels";
import { DragHandleIcon } from "@/components/icons/DragHandleIcon";
import { EmailContent } from "@/components/EmailContent";
import { EmailRenderView } from "@/components/EmailRenderView";
import { EmailHeader } from "@/components/EmailHeader";

// 自定义调整大小的手柄组件
function ResizeHandle() {
  return (
    <PanelResizeHandle className="group flex w-4 items-center justify-center bg-transparent">
      <DragHandleIcon className="text-gray-500/50 transition-colors group-hover:text-gray-300" />
    </PanelResizeHandle>
  );
}

export default function EmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <EmailContent id={resolvedParams.id} className="h-screen w-screen">
      {(email) => (
        <PanelGroup direction="horizontal">
          <Panel
            defaultSize={50}
            minSize={30}
            className="flex h-full flex-col border border-dark-border bg-dark-card p-6"
          >
            <div className="mb-4">
              <EmailHeader
                topic={email.topic}
                sender={email.sender}
                recipient={email.recipient}
                date={email.date}
              />
            </div>
            <EmailRenderView html={email.html} className="flex-1" />
          </Panel>

          <ResizeHandle />

          <Panel defaultSize={50} minSize={40}>
            <EmailSourceView html={email.html} />
          </Panel>
        </PanelGroup>
      )}
    </EmailContent>
  );
}
