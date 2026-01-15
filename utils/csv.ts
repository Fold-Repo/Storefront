/**
 * Simple CSV parser that handles quoted values
 */
export const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        // Split by comma but ignore commas inside quotes
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const entry: any = {};

        headers.forEach((header, index) => {
            let val = values[index]?.trim() || "";
            // Remove surrounding quotes if present
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
            }
            entry[header] = val;
        });

        results.push(entry);
    }

    return results;
};

/**
 * Maps CSV entry to Product Payload
 */
export const mapCSVToProduct = (entry: any) => {
    return {
        name: entry.name || entry.title || "Untitled Product",
        sku: entry.sku || "",
        product_description: entry.description || entry.product_description || "",
        category_id: entry.category_id ? parseInt(entry.category_id) : null,
        brand_id: entry.brand_id ? parseInt(entry.brand_id) : null,
        unit_id: entry.unit_id ? parseInt(entry.unit_id) : null,
        single_dpp: entry.cost_price || entry.purchase_price || "0",
        single_dsp: entry.selling_price || entry.price || "0",
        alert_quantity: entry.alert_quantity || "10",
        type: "single"
    };
};
