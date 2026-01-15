"use client";

import React, { useState } from "react";
import { ecommerceApi } from "@/services/ecommerceApi";
import { Button } from "@/components/ui";
import { parseCSV, mapCSVToProduct } from "@/utils/csv";
import { useToast } from "@/hooks/useToast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowLeftIcon,
    CloudArrowUpIcon,
    DocumentChartBarIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BulkImportPage() {
    const router = useRouter();
    const { showError, showSuccess } = useToast();
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const parsed = parseCSV(text);
            const mapped = parsed.map(mapCSVToProduct);
            setPreviewData(mapped);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;
        setImporting(true);
        let successCount = 0;
        let failedCount = 0;

        for (const product of previewData) {
            try {
                await ecommerceApi.createProduct(product);
                successCount++;
            } catch (error) {
                console.error("Failed to import product:", product.name, error);
                failedCount++;
            }
        }

        setImportResults({ success: successCount, failed: failedCount });
        setImporting(false);
        showSuccess(`Import complete: ${successCount} successful, ${failedCount} failed.`);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-10">
                <Link href="/dashboard/products text-neutral-400 hover:text-neutral-900 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Bulk Import Products</h1>
                    <p className="text-sm text-neutral-400 font-medium">Upload a CSV file to add multiple products at once.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-xl shadow-neutral-100/50 space-y-8">
                        <div className="flex items-center gap-3 pb-6 border-b border-neutral-50">
                            <div className="p-2.5 bg-blue-50 rounded-2xl">
                                <CloudArrowUpIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-black text-neutral-900 tracking-tight">Upload File</h2>
                        </div>

                        <div className="relative group">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-neutral-100 rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 bg-neutral-50/30 group-hover:bg-neutral-50 group-hover:border-blue-200 transition-all text-center">
                                <div className="p-4 bg-white rounded-2xl shadow-sm">
                                    <DocumentChartBarIcon className="w-8 h-8 text-neutral-300 group-hover:text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-black text-neutral-900 text-sm">Click to upload CSV</p>
                                    <p className="text-[10px] text-neutral-400 font-medium mt-1 uppercase tracking-widest">Only .csv files accepted</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">CSV Requirements</h3>
                            <ul className="text-xs text-amber-700 font-medium space-y-2 list-disc pl-4">
                                <li>Headers: Name, SKU, Description, Category_ID, Price</li>
                                <li>Date format: YYYY-MM-DD</li>
                                <li>Max 500 rows per upload</li>
                            </ul>
                        </div>

                        {previewData.length > 0 && !importResults && (
                            <Button
                                onPress={handleImport}
                                loading={importing}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-200/50"
                            >
                                Import {previewData.length} Products
                            </Button>
                        )}

                        {importResults && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-black text-green-700 uppercase">Success</span>
                                    </div>
                                    <span className="font-black text-green-900">{importResults.success}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <ExclamationCircleIcon className="w-4 h-4 text-red-600" />
                                        <span className="text-xs font-black text-red-700 uppercase">Failed</span>
                                    </div>
                                    <span className="font-black text-red-900">{importResults.failed}</span>
                                </div>
                                <Button
                                    onPress={() => router.push("/dashboard/products")}
                                    variant="light"
                                    className="w-full h-12 rounded-xl font-bold text-neutral-400"
                                >
                                    Back to Products
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden min-h-[400px]">
                        {previewData.length > 0 ? (
                            <Table>
                                <TableHeader className="bg-neutral-50/50">
                                    <TableRow>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Product</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">SKU</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-bold text-neutral-900">{row.name}</TableCell>
                                            <TableCell className="font-mono text-neutral-400 text-xs">{row.sku}</TableCell>
                                            <TableCell className="font-black text-neutral-700">₦{row.single_dsp}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-30">
                                <DocumentChartBarIcon className="w-16 h-16 text-neutral-200 mb-4" />
                                <p className="font-black text-neutral-900 uppercase tracking-widest text-sm">No Preview Data</p>
                                <p className="text-xs text-neutral-400 font-medium">Upload a CSV to preview products here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
