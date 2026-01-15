"use client";

import React from "react";
import { cn } from "@/lib";
import ErrorMessage from "./ErrorMessage";
import { controlRadiusClasses } from "./constants";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string | React.ReactNode;
    name?: string;
    className?: string;
    formGroupClass?: string;
    labelClassName?: string;
    fullWidth?: boolean;
    radius?: "none" | "sm" | "md" | "lg" | "xl" | "full";
    error?: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    value?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
    label,
    name,
    className,
    formGroupClass,
    labelClassName,
    fullWidth,
    radius = "md",
    error,
    checked,
    onChange,
    onBlur,
    value,
    ...props
}) => {
    return (
        <div className={cn("mb-0 pb-0 text-light", formGroupClass, fullWidth && "w-full")}>
            <label className={cn("inline-flex items-start cursor-pointer gap-2 text-xs", labelClassName)}>
                <input
                    {...props}
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    className={cn(`shrink-0 rounded-lg text-[#E6E9EF] pointer-events-none checked:bg-primary focus:ring-primary ring-1 size-4.5 ${className}`)}
                />
                {label && <span className={cn("text-sm text-gray-600 max-w-md", labelClassName)}>{label}</span>}
            </label>
            <ErrorMessage error={error} />
        </div>
    );
};

export default Checkbox;