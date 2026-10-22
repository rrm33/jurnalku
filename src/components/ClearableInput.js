"use client";

import { useRef } from "react";
import { X } from "lucide-react";

export default function ClearableInput({
  value,
  onChange,
  onClear,
  type = "text",
  placeholder = "",
  className = "",
  containerClassName = "",
  icon: Icon,
  iconSize = 18,
  iconClassName = "text-slate-400",
  clearButtonClassName = "text-slate-400 hover:text-slate-600",
  clearButtonSize = 16,
  required = false,
  disabled = false,
  autoFocus = false,
  ...props
}) {
  const inputRef = useRef(null);

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: "" } });
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const hasValue = value !== undefined && value !== null && String(value).length > 0;

  return (
    <div className={`relative flex items-center ${containerClassName}`}>
      {Icon && (
        <div className={`absolute left-3.5 pointer-events-none flex items-center justify-center ${iconClassName}`}>
          <Icon size={iconSize} />
        </div>
      )}
      <input
        ref={inputRef}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`${className} ${Icon ? "pl-11" : ""} ${hasValue && !disabled ? "pr-9" : ""}`}
        {...props}
      />
      {hasValue && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          onClick={handleClear}
          className={`absolute right-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors ${clearButtonClassName}`}
          title="Bersihkan isian"
        >
          <X size={clearButtonSize} />
        </button>
      )}
    </div>
  );
}
