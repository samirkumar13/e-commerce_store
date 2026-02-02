/**
 * Resolves the full URL for an image.
 * If the image path starts with 'http', it's treated as an external URL.
 * If it starts with '/uploads/', it's treated as a local path and the backend URL is prepended.
 */
export const getImageUrl = (path?: string | null): string => {
    if (!path) return 'https://via.placeholder.com/300?text=No+Image';

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    if (path.startsWith('/uploads/')) {
        // Determine backend base URL
        let baseUrl = 'http://localhost:5000';

        if (process.env.REACT_APP_API_URL) {
            // Remove '/api' or '/api/admin' suffix if present to get the root
            const url = new URL(process.env.REACT_APP_API_URL);
            baseUrl = `${url.protocol}//${url.host}`;
        } else if (window.location.hostname.includes('onrender.com')) {
            // Production URL fallback
            baseUrl = 'https://circuithub-api.onrender.com';
        }

        return `${baseUrl}${path}`;
    }

    // Return original path if it doesn't match known patterns (could be a local asset or relative path)
    return path;
};
