"use client";

import React from "react";
import { cn } from "@/lib";
import ErrorMessage from "./ErrorMessage";
import { controlRadiusClasses } from "./constants";

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
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

const Radio: React.FC<RadioProps> = ({
    label,
    name,
    className,
    formGroupClass,
    labelClassName,
    fullWidth,
    radius = "full",
    error,
    checked,
    onChange,
    onBlur,
    value,
    ...props
}) => {
    return (
        <div className={cn("mb-0 pb-0 text-light", formGroupClass, fullWidth && "w-full")}>
            <label className={cn("inline-flex items-center cursor-pointer gap-2 text-xs", labelClassName)}>
                <input
                    {...props}
                    type="radio"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    className="peer hidden"
                />
                <div className={cn(
                    "size-4 border flex items-center justify-center",
                    "border-[#E6E9EF] peer-checked:border-[#DDC58F]",
                    "peer-focus:ring-2 peer-focus:ring-[#DDC58F]/15 transition-all",
                    "relative after:content-[''] after:absolute after:size-2",
                    "after:bg-[#DDC58F] after:scale-0 peer-checked:after:scale-100",
                    controlRadiusClasses[radius],
                    error && "border-red-500",
                    className
                )} />
                {label && <span className={cn("text-sm text-black", labelClassName)}>{label}</span>}
            </label>
            <ErrorMessage error={error} />
        </div>
    );
};

export default Radio;