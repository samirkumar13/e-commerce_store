export const formatOrderId = (orderId: string): string => {
    // If orderId is UUID or long string, format it for display
    // Example goal: OD7842914829 -> OD-784291-4829

    if (!orderId) return '';

    // Clean up existing hyphens if any, to reformat consistently
    const cleanId = orderId.replace(/-/g, '');

    // If it starts with OD, preserve it, otherwise just chunk it
    if (cleanId.startsWith('OD')) {
        // OD + 6 chars + 4 chars
        const part1 = cleanId.slice(0, 2); // OD
        const part2 = cleanId.slice(2, 8);
        const part3 = cleanId.slice(8);
        return `${part1}-${part2}-${part3}`;
    }

    // Fallback for UUIDs: show first 8 chars or custom chunking
    // e.g. 550e8400-e29b-41d4-a716-446655440000
    // If it's a standard UUID, we might just want to show a short version or keep it as is?
    // User asked for specific visual change, let's assume specific ID format.
    // But for safety, if it's not matching the OD pattern, return as is or hyphenate every 4 chars?

    return orderId;
};
