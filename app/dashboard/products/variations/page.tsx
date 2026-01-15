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
    ViewColumnsIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

export default function VariationsPage() {
    const [variations, setVariations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [values, setValues] = useState<string[]>([""]);
    const [saving, setSaving] = useState(false);
    const { showError, showSuccess } = useToast();

    const fetchVariations = async () => {
        try {
            setLoading(true);
            const data = await ecommerceApi.getVariations();
            setVariations(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error("Error fetching variations:", error);
            showError("Failed to load variations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariations();
    }, []);

    const addValue = () => setValues([...values, ""]);
    const removeValue = (index: number) => setValues(values.filter((_, i) => i !== index));
    const updateValue = (index: number, val: string) => {
        const newValues = [...values];
        newValues[index] = val;
        setValues(newValues);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredValues = values.filter(v => v.trim());
        if (!name || filteredValues.length === 0) return;
        try {
            setSaving(true);
            await ecommerceApi.createVariation({ name, values: filteredValues });
            showSuccess("Variation created");
            setName("");
            setValues([""]);
            fetchVariations();
        } catch (error) {
            showError("Failed to create variation");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm sticky top-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-50 rounded-xl">
                            <ViewColumnsIcon className="w-5 h-5 text-pink-600" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 tracking-tight">New Variation</h2>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Template Name</label>
                            <Input
                                placeholder="e.g. Color, Size"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="rounded-2xl border-neutral-200 py-3"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Values</label>
                            {values.map((val, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Red, XL"
                                        value={val}
                                        onChange={(e) => updateValue(idx, e.target.value)}
                                        className="rounded-2xl border-neutral-200"
                                    />
                                    {values.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeValue(idx)}
                                            className="p-3 text-neutral-400 hover:text-red-500 transition-colors"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                onPress={addValue}
                                variant="light"
                                className="w-full border-dashed border-2 border-neutral-100 text-neutral-400 hover:border-neutral-200 hover:text-neutral-500 rounded-2xl h-12"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Value
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            loading={saving}
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-pink-100"
                        >
                            Create Template
                        </Button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-neutral-50/50">
                            <TableRow>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Variation</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Values</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-4 bg-neutral-100 rounded animate-pulse w-32"></div></TableCell>
                                        <TableCell><div className="h-4 bg-neutral-100 rounded animate-pulse w-64"></div></TableCell>
                                        <TableCell><div className="h-8 bg-neutral-100 rounded animate-pulse ml-auto w-8"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : variations.length > 0 ? (
                                variations.map((vari) => (
                                    <TableRow key={vari.id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-neutral-100 rounded-lg">
                                                    <ViewColumnsIcon className="w-4 h-4 text-neutral-400" />
                                                </div>
                                                <span className="font-black text-neutral-900">{vari.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {vari.values?.map((v: any, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 bg-neutral-50 text-neutral-400 border border-neutral-100 rounded text-[9px] font-black uppercase tracking-widest">
                                                        {v.name || v}
                                                    </span>
                                                ))}
                                            </div>
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
                                            <ViewColumnsIcon className="w-10 h-10 text-neutral-200" />
                                            <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">No variations found</p>
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
