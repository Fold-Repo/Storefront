
export const formatCurrency = (
    amount: number,
    currency: string = "GBP"
): string => {
    const locale: string = typeof navigator !== "undefined" ? navigator.language : "en-NG";

    const effectiveLocale = currency === "NGN" ? "en-NG" : locale;

    return new Intl.NumberFormat(effectiveLocale, {
        style: "currency",
        currency,
    }).format(amount);
};
