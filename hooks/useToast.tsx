"use client";

import { useCallback } from "react";
import { addToast, closeToast, Button } from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const useToast = () => {
    const showToast = useCallback((message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary', description?: string) => {
        // Define color-specific classes
        const colorClasses = {
            success: {
                base: "border-green-200 bg-green-50/90",
                title: "text-green-900",
                description: "text-green-700",
            },
            danger: {
                base: "border-red-200 bg-red-50/90",
                title: "text-red-900",
                description: "text-red-700",
            },
            warning: {
                base: "border-amber-200 bg-amber-50/90",
                title: "text-amber-900",
                description: "text-amber-700",
            },
            primary: {
                base: "border-blue-200 bg-blue-50/90",
                title: "text-blue-900",
                description: "text-blue-700",
            },
        };

        const selectedColors = colorClasses[color];
        let toastId: any;

        // Create toast options with 5-second auto-dismiss
        const toastOptions: any = {
            title: message,
            description,
            color,
            variant: "flat",
            timeout: 5000,
            radius: "lg",
            endContent: (
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                        if (toastId) closeToast(toastId);
                    }}
                    className="min-w-8 w-8 h-8 rounded-full hover:bg-black/5"
                >
                    <XMarkIcon className="w-4 h-4 text-neutral-500" />
                </Button>
            ),
            classNames: {
                base: `max-w-sm w-full shadow-lg backdrop-blur-sm ${selectedColors.base} pr-2`,
                title: `text-sm font-semibold ${selectedColors.title}`,
                description: `text-xs ${selectedColors.description}`,
                wrapper: "px-3 py-2",
            }
        };

        toastId = addToast(toastOptions);
    }, []);

    const showSuccess = useCallback((message: string, description?: string) => {
        showToast(message, 'success', description);
    }, [showToast]);

    const showError = useCallback((message: string, description?: string) => {
        showToast(message, 'danger', description);
    }, [showToast]);

    const showWarning = useCallback((message: string, description?: string) => {
        showToast(message, 'warning', description);
    }, [showToast]);

    const showInfo = useCallback((message: string, description?: string) => {
        showToast(message, 'primary', description);
    }, [showToast]);

    return {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
};
