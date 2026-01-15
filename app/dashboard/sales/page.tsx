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
import PopupModal from "@/components/ui/PopupModal";
import { useToast } from "@/hooks/useToast";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    EyeIcon,
    PencilIcon,
    TruckIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/outline";

export default function SalesPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { showError, showSuccess } = useToast();

    // Logistics Modal State
    const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [logisticsData, setLogisticsData] = useState({ courier: "", tracking_number: "" });
    const [savingLogistics, setSavingLogistics] = useState(false);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const data = await ecommerceApi.getSales();
            setSales(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error("Error fetching sales:", error);
            showError("Failed to load sales orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleUpdateLogistics = (sale: any) => {
        setSelectedSale(sale);
        setLogisticsData({
            courier: sale.courier || "",
            tracking_number: sale.tracking_number || ""
        });
        setIsLogisticsModalOpen(true);
    };

    const saveLogistics = async () => {
        if (!selectedSale) return;
        try {
            setSavingLogistics(true);
            await ecommerceApi.updateShippingDetails(selectedSale.id, logisticsData);
            showSuccess("Logistics updated successfully");
            setIsLogisticsModalOpen(false);
            fetchSales();
        } catch (error) {
            showError("Failed to update logistics");
        } finally {
            setSavingLogistics(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "final":
                return "bg-green-100 text-green-700 border-green-200";
            case "pending":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-neutral-100 text-neutral-600 border-neutral-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="light" size="sm" className="bg-white border-neutral-200 text-neutral-600 gap-2 h-11 px-5 rounded-2xl font-bold">
                        <FunnelIcon className="w-4 h-4" />
                        Filter
                    </Button>
                    <Button onPress={fetchSales} variant="light" size="sm" className="bg-white border-neutral-200 text-neutral-600 h-11 w-11 p-0 rounded-2xl">
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-neutral-50/50">
                        <TableRow>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Order ID</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Date</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Customer</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Total</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Logistics</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-neutral-100 rounded-lg animate-pulse"></div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : sales.length > 0 ? (
                            sales.map((sale) => (
                                <TableRow key={sale.id} className="hover:bg-neutral-50/50 transition-colors group">
                                    <TableCell className="font-mono font-bold text-neutral-400">#{sale.id || sale.invoice_no}</TableCell>
                                    <TableCell className="font-bold text-neutral-600">{new Date(sale.created_at || sale.transaction_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-black text-neutral-900 leading-tight">{sale.customer?.name || "Guest"}</span>
                                            <span className="text-[10px] text-neutral-400 font-medium">{sale.customer?.email || "No email"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-black text-neutral-900">
                                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(sale.final_total || 0)}
                                    </TableCell>
                                    <TableCell>
                                        {sale.courier ? (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase text-blue-600">{sale.courier}</span>
                                                <span className="text-[9px] text-neutral-400 font-mono">{sale.tracking_number}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-neutral-300">Pending</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(sale.status)}`}>
                                            {sale.status || "Pending"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                onPress={() => handleUpdateLogistics(sale)}
                                                className="h-8 w-8 p-0 bg-neutral-100 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                                            >
                                                <TruckIcon className="w-4 h-4" />
                                            </Button>
                                            <Button variant="light" size="sm" className="h-8 w-8 p-0 bg-neutral-100 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg">
                                                <EyeIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="p-4 bg-neutral-50 rounded-3xl">
                                            <ShoppingCartIcon className="w-10 h-10 text-neutral-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-neutral-900 tracking-tight">No orders found</p>
                                            <p className="text-xs text-neutral-400 font-medium">When you have sales, they'll appear here.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Logistics Modal */}
            <PopupModal
                isOpen={isLogisticsModalOpen}
                onClose={() => setIsLogisticsModalOpen(false)}
                title="Update Logistics"
                description={`Order #${selectedSale?.id || selectedSale?.invoice_no}`}
                icon={<TruckIcon className="w-5 h-5 text-blue-600" />}
                footer={
                    <div className="flex items-center justify-end gap-3 w-full">
                        <Button
                            variant="light"
                            onPress={() => setIsLogisticsModalOpen(false)}
                            className="rounded-xl font-bold text-neutral-500"
                        >
                            Cancel
                        </Button>
                        <Button
                            onPress={saveLogistics}
                            loading={savingLogistics}
                            className="bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] px-6"
                        >
                            Save Details
                        </Button>
                    </div>
                }
            >
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Courier Name</label>
                        <Input
                            name="courier"
                            placeholder="e.g. FedEx, DHL, GIG"
                            value={logisticsData.courier}
                            onChange={(e) => setLogisticsData(prev => ({ ...prev, courier: e.target.value }))}
                            className="rounded-2xl border-neutral-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tracking Number</label>
                        <Input
                            name="tracking_number"
                            placeholder="e.g. TRK-92837482"
                            value={logisticsData.tracking_number}
                            onChange={(e) => setLogisticsData(prev => ({ ...prev, tracking_number: e.target.value }))}
                            className="rounded-2xl border-neutral-200"
                        />
                    </div>
                </div>
            </PopupModal>
        </div>
    );
}
