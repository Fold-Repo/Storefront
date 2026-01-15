"use client";

import { useCallback } from "react";
import { addToast, closeToast, Button } from "@heroui/react";

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

        // Create toast options with 10-second auto-dismiss
        const toastOptions: any = {
            title: message,
            description,
            color,
            variant: "flat",
            timeout: 10000, // 10 seconds in milliseconds
            radius: "lg",
            action: (
                <Button
                    size="sm"
                    variant="light"
                    className="font-bold uppercase tracking-widest text-[10px]"
                    onPress={() => {
                        if (toastId) closeToast(toastId);
                    }}
                >
                    Cancel
                </Button>
            ),
            classNames: {
                base: `max-w-sm w-full shadow-lg backdrop-blur-sm ${selectedColors.base}`,
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
