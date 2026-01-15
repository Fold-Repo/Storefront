import React from 'react'

interface FileLabelProps {
    name: string
    fileTypes?: string[]
    required?: boolean
}

interface InputLabelProps {
    name: string
    required?: boolean
}

export const createFileLabel = ({ name, fileTypes, required = false }: FileLabelProps) => {
    const fileTypesStr = fileTypes?.join(', ') || ''
    return (
        <>
            <span>{name}</span>
            {fileTypesStr && <span className="text-xs text-gray-500">({fileTypesStr}) | not more than 500kb</span>}
            {required && <span className="text-red-500">*</span>}
        </>
    )
}

export const createInputLabel = ({ name, required = false }: InputLabelProps) => {
    return (
        <>
            <span>{name}</span>
            {required && <span className="text-red-500">*</span>}
        </>
    )
}

