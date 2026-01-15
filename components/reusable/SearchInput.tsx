'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/classname';

type Props = {
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    iconClassName?: string;
    onSearch?: (value: string) => void;
    debounceDelay?: number;
};

const SearchInput = ({ 
    placeholder = "Search...", 
    className,
    inputClassName,
    iconClassName,
    onSearch,
    debounceDelay = 500
}: Props) => {
    
    const [inputValue, setInputValue] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, debounceDelay);

        return () => clearTimeout(handler);
    }, [inputValue, debounceDelay]);

    useEffect(() => {
        if (onSearch) {
            onSearch(debouncedValue);
        }
    }, [debouncedValue, onSearch]);

    return (
        <div className={cn("relative w-full sm:w-auto text-slate-400", className)}>
            <div className="absolute inset-y-0 left-3 flex items-center">
                <MagnifyingGlassIcon className={cn('size-4.5', iconClassName)} />
            </div>
            <input
                type="search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={cn(
                    "form-control h-10 text-[12.5px] placeholder:text-[12.5px] pl-9 rounded-xl w-full border-[#EFECEB]",
                    inputClassName
                )}
                placeholder={placeholder}
            />
        </div>
    );
};

export default SearchInput;