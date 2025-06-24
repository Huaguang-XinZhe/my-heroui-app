"use client";

import { RadioGroup, Radio } from "@heroui/radio";
import { ProtocolType } from "@/types/email";

interface ProtocolSelectorProps {
  value: ProtocolType;
  onChange: (value: ProtocolType) => void;
}

export function ProtocolSelector({ value, onChange }: ProtocolSelectorProps) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-medium text-gray-300">
        协议类型
      </label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as ProtocolType)}
        defaultValue="UNKNOWN"
        orientation="horizontal"
        classNames={{
          wrapper: "gap-4",
        }}
      >
        <Radio value="GRAPH">Graph</Radio>
        <Radio value="IMAP">IMAP</Radio>
        <Radio value="UNKNOWN">未知</Radio>
      </RadioGroup>
    </div>
  );
}
