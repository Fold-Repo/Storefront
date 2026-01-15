'use client'

import { cn } from "@/lib";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
    Modal,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/react";
import { ReactElement, ReactNode } from "react";

const PopupModal = ({
    isOpen,
    onClose,
    size,
    backdrops,
    placement,
    className,
    name,
    children,
    showCloseButton = true,
    title,
    description,
    icon,
    footer,
    radius = "lg",
    isDismissable = true,
    headerClassName = "p-3",
    bodyClassName = "p-3",
    footerClassName = "p-3"
}: {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    name?: string;
    children?: string | ReactElement | ReactNode | ReactElement[] | ReactNode[];
    backdrops?: "opaque" | "blur" | "transparent" | undefined;
    size?: "xl" | "xs" | "sm" | "md" | "lg" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full" | undefined;
    placement?: "center" | "auto" | "top" | "top-center" | "bottom" | "bottom-center" | undefined;
    showCloseButton?: boolean;
    title?: string | ReactNode;
    description?: string | ReactNode;
    icon?: ReactNode;
    footer?: ReactNode;
    radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
    isDismissable?: boolean;
    headerClassName?: string;
    bodyClassName?: string;
    footerClassName?: string;
}) => {
    // Map custom sizes to supported sizes and add custom width classes
    const getModalSize = () => {
        if (size === "6xl" || size === "7xl") {
            return "5xl" as const; // Use largest supported size
        }
        return size || "lg";
    };

    const getCustomSizeClass = () => {
        if (size === "6xl") {
            return "max-w-[72rem]"; // 1152px
        }
        if (size === "7xl") {
            return "max-w-[80rem]"; // 1280px
        }
        return "";
    };

    return (
        <Modal
            id={name ? name : `modal-${Date.now()}`}
            size={getModalSize()}
            isOpen={isOpen}
            onClose={onClose}
            isDismissable={isDismissable}
            className={cn(className, getCustomSizeClass())}
            classNames={{
                closeButton: "hidden",
                base: `bg-white overflow-hidden rounded-${radius} shadow-lg`,
            }}
            placement={placement ? placement : "center"}
            scrollBehavior="inside"
            backdrop={backdrops ? backdrops : "opaque"}>
            <ModalContent>
                {(onClose) => ( 
                    <>
                        {title && (
                            <ModalHeader className={`bg-[#F6F8FA] border border-[#E2E4E9] relative 
                                flex items-center justify-between py-3 ${headerClassName}`}>
                                <div className="flex-1 pr-10">
                                    <div className="flex items-center gap-2">
                                        {icon && <span className="shrink-0">{icon}</span>}
                                        <h2 className='text-base font-medium text-text-color'>{title}</h2>
                                    </div>
                                    {description && (
                                        <p className='text-xs font-normal text-gray-500 mt-0.5'>{description}</p>
                                    )}
                                </div>

                                {showCloseButton && (
                                    <Button size='sm' radius='full' isIconOnly 
                                        onPress={onClose} 
                                        variant="light"
                                        className='text-text-color bg-gray-200 shrink-0'>
                                        <XMarkIcon className='size-4' />
                                    </Button>
                                )}
                            </ModalHeader>
                        )}

                        <ModalBody className={`${bodyClassName} ${!title ? 'p-0' : ''} gap-0`}>
                            {children}
                        </ModalBody>

                        {footer && (
                            <ModalFooter className={`bg-[#F6F8FA] border border-[#E2E4E9] py-3 relative ${footerClassName}`}>
                                {footer}
                            </ModalFooter>
                        )}
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default PopupModal;