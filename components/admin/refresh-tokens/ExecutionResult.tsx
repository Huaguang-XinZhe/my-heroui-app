"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Textarea } from "@heroui/input";

interface ExecutionResultProps {
  result: string;
}

export default function ExecutionResult({ result }: ExecutionResultProps) {
  if (!result) return null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">执行结果</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <Textarea
          value={result}
          readOnly
          minRows={10}
          maxRows={20}
          className="font-mono text-sm"
          placeholder="执行结果将在这里显示..."
        />
      </CardBody>
    </Card>
  );
}
