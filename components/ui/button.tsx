"use client"

import type React from "react"
import { Button, type ButtonProps, Spinner } from "@heroui/react"
import type { CustomButtonColorType } from "@/types"
import { cn } from "@/lib"

type NormalSizes = "xs" | "sm" | "md" | "lg" | "xl"
type ButtonVariants = "solid" | "faded" | "bordered" | "light" | "flat" | "ghost" | "shadow"

type SpinnerSizes = "sm" | "md" | "lg" | undefined

interface CustomButtonProps extends Omit<ButtonProps, "color" | "icon" | "size" | "disabled" | "onClick" | "variant"> {
    type?: "button" | "submit" | "reset"
    isDisabled?: boolean
    onClick?: ButtonProps["onPress"]
    onPress?: ButtonProps["onPress"]
    color?: CustomButtonColorType
    size?: NormalSizes
    className?: string
    loading?: boolean
    spinnerColor?: CustomButtonColorType
    spinnerSize?: SpinnerSizes
    children?: React.ReactNode
    startContent?: React.ReactNode
    endContent?: React.ReactNode
    bordered?: boolean
    variant?: ButtonVariants
}

const CustomButton: React.FC<CustomButtonProps> = ({
    type = "button",
    isDisabled = false,
    onClick,
    onPress,
    color = "default",
    size = "md",
    className,
    loading = false,
    spinnerColor = "default",
    spinnerSize = "sm",
    children,
    startContent,
    endContent,
    bordered,
    variant = "solid",
    ...rest
}) => {
    return (
        <Button
            type={type}
            isDisabled={isDisabled || loading}
            onPress={onPress || onClick}
            color={color as ButtonProps["color"]}
            size={size as ButtonProps["size"]}
            variant={variant as ButtonProps["variant"]}
            className={cn(
                "flex items-center gap-1 text-xs font-medium transition-colors",
                className,
            )}
            bordered={bordered}
            {...rest}>
            {loading ? (
                <Spinner color={spinnerColor as ButtonProps["color"]} size={spinnerSize} />
            ) : (
                <>
                    {startContent && <span className="mr-1">{startContent}</span>}
                    {children}
                    {endContent && <span className="ml-1">{endContent}</span>}
                </>
            )}
        </Button>
    )
}

export default CustomButton
