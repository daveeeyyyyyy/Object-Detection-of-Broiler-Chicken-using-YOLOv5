import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"; // Import the base Input component
import { cn } from "@/lib/utils"; // Utility for class names

// Define props interface
interface MoneyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  options: OptionalOptions;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ options, className, value, onChange, defaultValue, ...props }, ref) => {
    const { is_money, decorator } = options.addOnBefore;

    const formatNumber = (num: number): string => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const [inputValue, setInputValue] = useState<string>(
      value ? formatNumber(value as number) : ""
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/,/g, "");
      const numericValue = rawValue.replace(/[^0-9]/g, "");

      setInputValue(formatNumber(Number(numericValue)));

      if (onChange) {
        onChange(e);
      }
    };

    useEffect(() => {
      if (value) {
        setInputValue(formatNumber(value as number));
      }
    }, [value]);

    return (
      <div
        className={cn(
          "flex items-center border border-gray-300 rounded-md",
          className
        )}
      >
        {is_money && decorator && (
          <span className="px-2 text-gray-500">{decorator}</span>
        )}
        <Input
          ref={ref}
          className="rounded-none"
          value={inputValue != "" ? inputValue : undefined}
          onChange={handleChange}
          defaultValue={defaultValue}
          {...props}
        />
      </div>
    );
  }
);

MoneyInput.displayName = "MoneyInput";

export default MoneyInput;

interface OptionalOptions {
  addOnBefore: {
    is_money: boolean;
    decorator: string;
  };
}
