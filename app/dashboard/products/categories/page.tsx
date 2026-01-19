"use client";

import React, { useState, useEffect } from "react";
import { ecommerceApi } from "@/services/ecommerceApi";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/form";
import { useToast } from "@/hooks/useToast";
import {
    PlusIcon,
    TrashIcon,
    TagIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const { showError, showSuccess } = useToast();

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await ecommerceApi.getCategories();
            // Handle different response formats
            if (Array.isArray(data)) {
                setCategories(data);
            } else if (data?.data && Array.isArray(data.data)) {
                setCategories(data.data);
            } else if (data?.categories && Array.isArray(data.categories)) {
                setCategories(data.categories);
            } else {
                setCategories([]);
            }
        } catch (error: any) {
            console.error("Error fetching categories:", error);
            // Only show error if it's not a 404 (endpoint not implemented)
            if (error.response?.status !== 404) {
                showError("Failed to load categories");
            }
            setCategories([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        try {
            setSaving(true);
            await ecommerceApi.createCategory({ name, description });
            showSuccess("Category created");
            setName("");
            setDescription("");
            fetchCategories();
        } catch (error) {
            showError("Failed to create category");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm sticky top-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <PlusIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 tracking-tight">New Category</h2>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Name</label>
                            <Input
                                name="categoryName"
                                placeholder="e.g. Electronics"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="rounded-2xl border-neutral-200 py-3"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Description</label>
                            <textarea
                                placeholder="Optional description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-2xl border-neutral-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px] bg-neutral-50/30 font-medium"
                            />
                        </div>
                        <Button
                            type="submit"
                            loading={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100"
                        >
                            Create Category
                        </Button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-neutral-50/50">
                            <TableRow>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Name</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Description</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-4 bg-neutral-100 rounded animate-pulse w-32"></div></TableCell>
                                        <TableCell><div className="h-4 bg-neutral-100 rounded animate-pulse w-48"></div></TableCell>
                                        <TableCell><div className="h-8 bg-neutral-100 rounded animate-pulse ml-auto w-8"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : categories.length > 0 ? (
                                categories.map((cat, index) => (
                                    <TableRow key={cat.id || `cat-${index}`} className="hover:bg-neutral-50/50 transition-colors group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-neutral-100 rounded-lg">
                                                    <TagIcon className="w-4 h-4 text-neutral-400" />
                                                </div>
                                                <span className="font-black text-neutral-900">{cat.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-500 text-[11px] font-medium max-w-xs truncate">
                                            {cat.description || "No description"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="light" size="sm" className="h-8 w-8 p-0 bg-neutral-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg opacity-0 group-hover:opacity-100">
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <TagIcon className="w-10 h-10 text-neutral-200" />
                                            <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">No categories found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
