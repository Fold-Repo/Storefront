'use client'

import React, { ReactNode, useState, useEffect } from "react";
import {
    Dropdown as HeroDropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button
} from "@heroui/react";
import { cn } from "@/lib";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

type DropdownItemType = {
    key: string;
    label: string;
    icon?: ReactNode;
    className?: string;
}

type MenuDropdownProps = {
    label?: string;
    value?: string;
    items: DropdownItemType[];
    onChange?: (key: string) => void;
    triggerClassName?: string;
    startContent?: ReactNode;
    endContent?: ReactNode;
    showChevron?: boolean;
    menuClassName?: string;
    itemClassName?: string;
    className?: string;
    trigger?: ReactNode;
};

const MenuDropdown: React.FC<MenuDropdownProps> = ({
    label,
    value,
    items = [],
    onChange,
    triggerClassName,
    startContent,
    endContent,
    showChevron = true,
    menuClassName,
    itemClassName,
    className,
    trigger
}) => {

    const [internalLabel, setInternalLabel] = useState(label || items[0]?.label || "Select");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (value !== undefined) {
            const found = items.find(i => i.key === value);
            setInternalLabel(found ? found.label : (label || "Select"));
        }
    }, [value, items, label]);

    const handleSelect = (key: string, itemLabel: string) => {
        if (value === undefined) {
            setInternalLabel(itemLabel);
        }
        if (onChange) onChange(key);
        setIsOpen(false);
    };

    return (
        <HeroDropdown
            className={className}
            onOpenChange={(open) => setIsOpen(open)}>

            <DropdownTrigger>
                {trigger ? trigger : (
                    <Button
                        aria-label={`Select ${internalLabel}`}
                        startContent={startContent}
                        endContent={
                            endContent ? endContent : (
                                showChevron && (
                                    <ChevronDownIcon
                                        className={cn(
                                            "size-3.5 transition-transform duration-300",
                                            isOpen ? "rotate-180" : "rotate-0"
                                        )}
                                    />
                                )
                            )
                        }
                        className={cn("text-[12px] border-0 h-auto text-text-color rounded-lg p-2 bg-white", triggerClassName)}>
                        {internalLabel}
                    </Button>
                )}
            </DropdownTrigger>

            <DropdownMenu
                aria-label="Menu Dropdown"
                className={menuClassName}>
                {items.map(({ key, label: itemLabel, icon, className: itemClass }) => (
                    <DropdownItem
                        key={key}
                        startContent={icon}
                        className={cn(itemClassName, itemClass)}
                        classNames={{
                            base: "py-1",
                            title: "text-[12px] font-normal",
                        }}
                        onPress={() => handleSelect(key, itemLabel)}>
                        {itemLabel}
                    </DropdownItem>
                ))}
            </DropdownMenu>
            
        </HeroDropdown>
    );
};

export default MenuDropdown;