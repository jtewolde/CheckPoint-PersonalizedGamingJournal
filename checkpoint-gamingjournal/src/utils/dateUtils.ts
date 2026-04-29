// utils/dateUtils.ts

/**
 * Convert a JS Date → "YYYY-MM-DD"
 * Safe (no timezone issues)
 */
export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

/**
 * Compare stored date string with a Date object
 */
export function isSameDay(
    date1: string | Date,
    date2: string | Date
    ) {
    const normalize = (d: string | Date) => {
        if (typeof d === "string") {
            const [y, m, day] = d.split("-").map(Number);
            return new Date(y, m - 1, day);
        }

        return new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate()
        );
    };

    return normalize(date1).getTime() === normalize(date2).getTime();
}

/**
 * Get today's date as "YYYY-MM-DD"
 */
export const getToday = (): string => {
    return formatDate(new Date());
};

/**
 * Convert "YYYY-MM-DD" → readable format (UI only)
 */
export const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString + "T00:00:00"); // prevent timezone shift
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};