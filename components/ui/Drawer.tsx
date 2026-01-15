'use client'

import React, { ReactNode } from 'react'
import {
    Drawer as HeroDrawer,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    Button,
    useDisclosure,
} from "@heroui/react"
import { XMarkIcon } from '@heroicons/react/24/outline'

type DrawerProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    placement?: 'top' | 'bottom' | 'left' | 'right'
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    title?: ReactNode
    icon?: ReactNode
    children: ReactNode
    footer?: ReactNode
    showCloseButton?: boolean
    className?: string
    contentClassName?: string
    headerClassName?: string
    bodyClassName?: string
    footerClassName?: string
}

const Drawer: React.FC<DrawerProps> = ({
    isOpen,
    onOpenChange,
    placement = 'right',
    size = 'md',
    title,
    icon,
    children,
    footer,
    showCloseButton = true,
    className = '',
    contentClassName = '',
    headerClassName = 'p-3',
    bodyClassName = 'p-3',
    footerClassName = 'p-3'
}) => {
    return (
        <HeroDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement={placement}
            size={size}
            hideCloseButton={true}
            className={className}>
            <DrawerContent className={contentClassName}>

                {title && (
                    <DrawerHeader className={`bg-[#F6F8FA] border border-[#E2E4E9] relative 
                    flex items-center justify-between py-3 ${headerClassName}`}>
                        <div className="flex items-center gap-2 pr-10">
                            {icon && <span className="shrink-0">{icon}</span>}
                            <h2 className='text-sm font-medium text-text-color'>{title}</h2>
                        </div>

                        {showCloseButton && (
                            <Button 
                                size='sm' 
                                radius='full' 
                                isIconOnly 
                                onPress={() => onOpenChange(false)} 
                                className='text-text-color bg-gray-200 '>
                                <XMarkIcon className='size-4' />
                            </Button>
                        )}

                    </DrawerHeader>
                )}

                <DrawerBody className={bodyClassName}>
                    {children}
                </DrawerBody>

                {footer && (
                    <DrawerFooter className={`bg-[#F6F8FA] border border-[#E2E4E9] py-3 relative ${footerClassName}`}>
                        {footer}
                    </DrawerFooter>
                )}

            </DrawerContent>
        </HeroDrawer>
    )
}

export { Drawer, useDisclosure }

