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
    ScaleIcon,
    VariableIcon,
} from "@heroicons/react/24/outline";

export default function UnitsPage() {
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actualName, setActualName] = useState("");
    const [shortName, setShortName] = useState("");
    const [saving, setSaving] = useState(false);
    const { showError, showSuccess } = useToast();

    const fetchUnits = async () => {
        try {
            setLoading(true);
            const data = await ecommerceApi.getUnits();
            setUnits(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error("Error fetching units:", error);
            showError("Failed to load units");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actualName || !shortName) return;
        try {
            setSaving(true);
            await ecommerceApi.createUnit({ actual_name: actualName, short_name: shortName, allow_decimal: 0 });
            showSuccess("Unit created");
            setActualName("");
            setShortName("");
            fetchUnits();
        } catch (error) {
            showError("Failed to create unit");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm sticky top-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <ScaleIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 tracking-tight">New Unit</h2>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Unit Name</label>
                            <Input
                                placeholder="e.g. Kilograms, Pieces"
                                value={actualName}
                                onChange={(e) => setActualName(e.target.value)}
                                className="rounded-2xl border-neutral-200 py-3"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Short Name</label>
                            <Input
                                placeholder="e.g. Kg, Pcs"
                                value={shortName}
                                onChange={(e) => setShortName(e.target.value)}
                                className="rounded-2xl border-neutral-200 py-3"
                            />
                        </div>
                        <Button
                            type="submit"
                            loading={saving}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-100"
                        >
                            Create Unit
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
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Short Name</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-4 bg-neutral-100 rounded animate-pulse w-32"></div></TableCell>
                                        <TableCell><div className="h-4 bg-neutral-100 rounded animate-pulse w-24"></div></TableCell>
                                        <TableCell><div className="h-8 bg-neutral-100 rounded animate-pulse ml-auto w-8"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : units.length > 0 ? (
                                units.map((unit) => (
                                    <TableRow key={unit.id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-neutral-100 rounded-lg">
                                                    <ScaleIcon className="w-4 h-4 text-neutral-400" />
                                                </div>
                                                <span className="font-black text-neutral-900">{unit.actual_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-neutral-200">
                                                {unit.short_name}
                                            </span>
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
                                            <ScaleIcon className="w-10 h-10 text-neutral-200" />
                                            <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">No units found</p>
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
