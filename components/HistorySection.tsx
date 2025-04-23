import { Card, CardBody, CardHeader } from "@heroui/card";
import Link from "next/link";

interface HistoryItem {
  id: string;
  title: string;
  content: string;
  time: string;
}

interface HistorySectionProps {
  title: string;
  items: HistoryItem[];
}

export function HistorySection({ title, items }: HistorySectionProps) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 flex items-center text-sm font-medium text-gray-400">
        <span className="mr-2 h-1 w-1 rounded-full bg-indigo-500"></span>
        {title}
      </h3>
      <div>
        {items.map((item, index) => (
          <Card
            key={index}
            as={Link}
            href={`/emails/${item.id}`}
            scroll={false}
            prefetch={false}
            isPressable
            shadow="none"
            radius="lg"
            className="w-full bg-transparent hover:bg-indigo-300/10"
          >
            {/* 在 CardBody 上加 flex-row❗在 hover 效果上加 10% 透明度❗ */}
            <CardBody className="flex flex-row items-center justify-between py-2 pl-4 pr-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-200">
                  {item.title}
                </h3>
                <div className="mt-1 truncate text-xs text-gray-500">
                  {item.content}
                </div>
              </div>
              <div className="ml-2 shrink-0 rounded bg-dark-input px-1.5 py-0.5 text-xs text-gray-500">
                {item.time}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
