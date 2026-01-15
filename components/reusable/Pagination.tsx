'use client'

import React from 'react'
import { Button } from '@heroui/react'

type PaginationProps = {
    currentPage: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    showingText?: string
    className?: string
    previousLabel?: string
    nextLabel?: string
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    showingText,
    className = '',
    previousLabel = 'Previous',
    nextLabel = 'Next'
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    // If showingText is provided and contains "Showing" or is a full sentence, use it as-is
    // Otherwise, treat it as an item type word (e.g., "transactions", "users")
    const itemType = showingText && !showingText.includes('Showing') && !showingText.includes('.') 
        ? showingText 
        : 'items'
    
    const defaultShowingText = showingText && (showingText.includes('Showing') || showingText.includes('.'))
        ? showingText
        : `Showing ${startItem}${endItem > startItem ? `-${endItem}` : ''} of ${totalItems} ${itemType}.`

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1)
        }
    }

    return (
        <div className={`flex items-center flex-wrap gap-2 justify-between ${className}`}>
            <p className='text-gray-500 text-xs'>
                {defaultShowingText}
            </p>

            <div className="flex items-center justify-end ms-auto gap-x-4">
                <p className='text-gray-500 text-xs'>
                    {currentPage} of {totalPages} pages
                </p>

                <div className="flex gap-x-1 items-center">
                    <Button
                        variant='light'
                        size='sm'
                        className='text-xs text-gray-600'
                        onPress={handlePrevious}
                        isDisabled={currentPage === 1}
                    >
                        {previousLabel}
                    </Button>

                    <Button
                        variant='light'
                        size='sm'
                        className='text-xs text-gray-600'
                        onPress={handleNext}
                        isDisabled={currentPage === totalPages}
                    >
                        {nextLabel}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Pagination

