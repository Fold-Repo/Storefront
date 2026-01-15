"use client";

import React, { useState, useEffect } from "react";
import { ecommerceApi } from "@/services/ecommerceApi";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/form";
import { useToast } from "@/hooks/useToast";
import {
    ArrowLeftIcon,
    PhotoIcon,
    InformationCircleIcon,
    CurrencyDollarIcon,
    ArchiveBoxIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
    const router = useRouter();
    const { showError, showSuccess } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category_id: "",
        brand_id: "",
        unit_id: "",
        product_description: "",
        alert_quantity: "10",
        single_dpp: "", // Purchase Price (Excl. Tax)
        single_dpp_inc_tax: "", // Purchase Price (Incl. Tax)
        profit_percent: "25",
        single_dsp: "", // Selling Price (Excl. Tax)
        single_dsp_inc_tax: "", // Selling Price (Incl. Tax)
        image: null as File | null,
    });

    // Options State
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [cats, brs, unts] = await Promise.all([
                    ecommerceApi.getCategories(),
                    ecommerceApi.getBrands(),
                    ecommerceApi.getUnits()
                ]);
                setCategories(Array.isArray(cats) ? cats : cats?.data || []);
                setBrands(Array.isArray(brs) ? brs : brs?.data || []);
                setUnits(Array.isArray(unts) ? unts : unts?.data || []);
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Construct payload based on API requirements
            const payload: any = {
                name: formData.name,
                sku: formData.sku,
                category_id: formData.category_id,
                brand_id: formData.brand_id,
                unit_id: formData.unit_id,
                product_description: formData.product_description,
                alert_quantity: formData.alert_quantity,
                single_dpp: formData.single_dpp,
                single_dpp_inc_tax: formData.single_dpp_inc_tax || formData.single_dpp,
                profit_percent: formData.profit_percent,
                single_dsp: formData.single_dsp,
                single_dsp_inc_tax: formData.single_dsp_inc_tax || formData.single_dsp,
                type: "single", // Supporting single for now
            };

            await ecommerceApi.createProduct(payload as any);
            showSuccess("Product created successfully!");
            router.push("/dashboard/products");
        } catch (error) {
            console.error("Error creating product:", error);
            showError("Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-10">
                <Link href="/dashboard/products text-neutral-400 hover:text-neutral-900 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Add New Product</h1>
                    <p className="text-sm text-neutral-400 font-medium">Create a new item in your store inventory.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* General Information */}
                <section className="bg-white p-10 rounded-[40px] border border-neutral-100 shadow-xl shadow-neutral-100/50 space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b border-neutral-50">
                        <div className="p-2.5 bg-blue-50 rounded-2xl">
                            <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 tracking-tight">General Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Product Name*</label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Premium Cotton T-Shirt"
                                className="rounded-2xl border-neutral-100 bg-neutral-50/30 py-4 font-bold text-neutral-900 focus:bg-white transition-all capitalize"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">SKU (Product ID)</label>
                            <Input
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="Keep empty for auto-generation"
                                className="rounded-2xl border-neutral-100 bg-neutral-50/30 py-4 font-mono font-bold text-neutral-500 focus:bg-white transition-all uppercase"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Category</label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-neutral-100 bg-neutral-50/30 p-4 font-bold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Brand</label>
                            <select
                                name="brand_id"
                                value={formData.brand_id}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-neutral-100 bg-neutral-50/30 p-4 font-bold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select Brand</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Unit</label>
                            <select
                                name="unit_id"
                                value={formData.unit_id}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-neutral-100 bg-neutral-50/30 p-4 font-bold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select Unit</option>
                                {units.map(unit => (
                                    <option key={unit.id} value={unit.id}>{unit.actual_name} ({unit.short_name})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Description</label>
                        <textarea
                            name="product_description"
                            value={formData.product_description}
                            onChange={handleChange}
                            placeholder="Tell your customers more about this product..."
                            className="w-full rounded-3xl border border-neutral-100 bg-neutral-50/30 p-6 font-medium text-neutral-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[160px]"
                        />
                    </div>
                </section>

                {/* Pricing & Stock */}
                <section className="bg-white p-10 rounded-[40px] border border-neutral-100 shadow-xl shadow-neutral-100/50 space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b border-neutral-50">
                        <div className="p-2.5 bg-emerald-50 rounded-2xl">
                            <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 tracking-tight">Pricing & Stock</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Cost Price (Purchase)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-neutral-400 tracking-tighter">₦</span>
                                <Input
                                    type="number"
                                    name="single_dpp"
                                    value={formData.single_dpp}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="rounded-2xl border-neutral-100 bg-neutral-50/30 py-4 pl-10 font-black text-neutral-900"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Profit (%)</label>
                            <Input
                                type="number"
                                name="profit_percent"
                                value={formData.profit_percent}
                                onChange={handleChange}
                                placeholder="25"
                                className="rounded-2xl border-neutral-100 bg-neutral-50/30 py-4 font-black text-neutral-900"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Selling Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-neutral-400 tracking-tighter">₦</span>
                                <Input
                                    type="number"
                                    name="single_dsp"
                                    value={formData.single_dsp}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="rounded-2xl border-neutral-100 bg-neutral-50/30 py-4 pl-10 font-black text-neutral-900"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Stock Alert Quantity</label>
                            <Input
                                type="number"
                                name="alert_quantity"
                                value={formData.alert_quantity}
                                onChange={handleChange}
                                className="rounded-2xl border-neutral-100 bg-neutral-50/30 py-4 font-black text-neutral-900"
                            />
                        </div>
                    </div>
                </section>

                {/* Media */}
                <section className="bg-white p-10 rounded-[40px] border border-neutral-100 shadow-xl shadow-neutral-100/50 space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b border-neutral-50">
                        <div className="p-2.5 bg-purple-50 rounded-2xl">
                            <PhotoIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 tracking-tight">Product Media</h2>
                    </div>

                    <div className="border-2 border-dashed border-neutral-100 rounded-[32px] p-20 flex flex-col items-center justify-center gap-4 bg-neutral-50/30 group hover:bg-neutral-50 hover:border-blue-200 transition-all cursor-pointer">
                        <div className="p-5 bg-white rounded-3xl shadow-sm group-hover:scale-110 transition-transform">
                            <PhotoIcon className="w-12 h-12 text-neutral-300 group-hover:text-blue-500" />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-neutral-900 tracking-tight">Drop your product image here</p>
                            <p className="text-xs text-neutral-400 font-medium mt-1">PNG, JPG or WEBP up to 5MB</p>
                        </div>
                        <Button type="button" variant="light" className="bg-white border-neutral-100 text-neutral-600 px-8 rounded-2xl h-11 mt-2 font-bold group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all">
                            Browse Files
                        </Button>
                    </div>
                </section>

                {/* Submit */}
                <div className="flex items-center justify-end gap-6 pt-10 border-t border-neutral-100">
                    <Link href="/dashboard/products">
                        <Button type="button" variant="light" className="px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        loading={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-12 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-200/50"
                    >
                        Save Product
                    </Button>
                </div>
            </form>
        </div>
    );
}
