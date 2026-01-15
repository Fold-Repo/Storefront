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
    BriefcaseIcon,
    CubeTransparentIcon,
} from "@heroicons/react/24/outline";

export default function BrandsPage() {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const { showError, showSuccess } = useToast();

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const data = await ecommerceApi.getBrands();
            setBrands(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error("Error fetching brands:", error);
            showError("Failed to load brands");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        try {
            setSaving(true);
            await ecommerceApi.createBrand({ name, description });
            showSuccess("Brand created");
            setName("");
            setDescription("");
            fetchBrands();
        } catch (error) {
            showError("Failed to create brand");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm sticky top-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <BriefcaseIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 tracking-tight">New Brand</h2>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Brand Name</label>
                            <Input
                                name="brandName"
                                placeholder="e.g. Nike, Apple"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="rounded-2xl border-neutral-200 py-3"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Description</label>
                            <textarea
                                placeholder="Optional details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-2xl border-neutral-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px] bg-neutral-50/30 font-medium"
                            />
                        </div>
                        <Button
                            type="submit"
                            loading={saving}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100"
                        >
                            Create Brand
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
                            ) : brands.length > 0 ? (
                                brands.map((brand) => (
                                    <TableRow key={brand.id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-neutral-100 rounded-lg">
                                                    <CubeTransparentIcon className="w-4 h-4 text-neutral-400" />
                                                </div>
                                                <span className="font-black text-neutral-900">{brand.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-500 text-[11px] font-medium max-w-xs truncate">
                                            {brand.description || "No description"}
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
                                            <BriefcaseIcon className="w-10 h-10 text-neutral-200" />
                                            <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">No brands found</p>
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
