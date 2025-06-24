import { Input } from "@heroui/input";
import { IconSearch } from "@/components/icons/icons";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
}

export function SearchInput({
  placeholder = "搜索...",
  value = "",
  onChange,
  onClear,
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="mb-4">
      <Input
        isClearable
        type="text"
        placeholder={placeholder}
        size="sm"
        value={value}
        onChange={handleChange}
        onClear={onClear}
        startContent={<IconSearch className="text-indigo-400/70" />}
        classNames={{
          input: "ml-1",
          inputWrapper: [
            "bg-dark-input",
            "group-hover:bg-gray-875",
            "group-data-[focus=true]:bg-dark-input",
          ],
        }}
      />
    </div>
  );
}
