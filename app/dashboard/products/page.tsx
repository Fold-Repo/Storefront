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
import { useToast } from "@/hooks/useToast";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    TrashIcon,
    ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { showError, showSuccess } = useToast();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await ecommerceApi.getProducts();
            setProducts(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            showError("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await ecommerceApi.deleteProduct(id);
            showSuccess("Product deleted successfully");
            fetchProducts();
        } catch (error) {
            showError("Failed to delete product");
        }
    };

    const getStockStatus = (quantity: number, alertLimit: number = 10) => {
        if (quantity <= 0) return { label: "Out of Stock", color: "bg-red-50 text-red-600 border-red-100" };
        if (quantity <= alertLimit) return { label: "Low Stock", color: "bg-amber-50 text-amber-600 border-amber-100" };
        return { label: "In Stock", color: "bg-green-50 text-green-600 border-green-100" };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/products/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100">
                            <PlusIcon className="w-5 h-5" />
                            Add Product
                        </Button>
                    </Link>
                    <Button onPress={fetchProducts} variant="light" size="sm" className="bg-white border-neutral-200 text-neutral-600 h-11 w-11 p-0 rounded-2xl">
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-neutral-50/50">
                        <TableRow>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Product</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Category</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Price</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Stock</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">SKU</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-neutral-100 rounded-lg animate-pulse"></div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : products.length > 0 ? (
                            products.map((product) => {
                                const stockStatus = getStockStatus(product.quantity_limit || 0, product.stock_alert);
                                return (
                                    <TableRow key={product.id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center overflow-hidden border border-neutral-200 shrink-0">
                                                    {product.images?.[0]?.url ? (
                                                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ArchiveBoxIcon className="w-6 h-6 text-neutral-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-neutral-900 leading-tight">{product.name}</span>
                                                    <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">{product.productType || "Simple"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-neutral-200">
                                                {product.category?.name || "Uncategorized"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-black text-neutral-900">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.productPrice || 0)}</span>
                                                <span className="text-[9px] text-neutral-400 font-medium line-through">{product.productCost && new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.productCost)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-neutral-700">{product.quantity_limit || 0}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${stockStatus.color}`}>
                                                    {stockStatus.label}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-[10px] text-neutral-400">{product.sku || "N/A"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/dashboard/products/${product.id}`}>
                                                    <Button variant="light" size="sm" className="h-8 w-8 p-0 bg-neutral-100 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg">
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    onPress={() => handleDelete(product.id)}
                                                    variant="light"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 bg-neutral-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="p-4 bg-neutral-50 rounded-3xl">
                                            <ArchiveBoxIcon className="w-10 h-10 text-neutral-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-neutral-900 tracking-tight">No products found</p>
                                            <p className="text-xs text-neutral-400 font-medium">Start adding products to your store.</p>
                                        </div>
                                        <Link href="/dashboard/products/new" className="mt-2">
                                            <Button size="sm" className="bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] px-6">
                                                Create Product
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
