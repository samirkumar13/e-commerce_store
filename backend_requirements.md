# Backend Requirements: Header & Home Page Integration

This document specifies the minimum backend requirements needed to support the features in the `feature/header-refinement` branch, transitioning from mock data to real API integration.

## 1. Data Models (Prisma Updates)

The following models are required to serve the dynamic content on the Home Page and Header.

### A. Navigation & Categories
- **Category**: Ensure `imageUrl` and `slug` are present for the "Shop" dropdown and Category Grid.

### B. Dynamic Content (Action Required)
- **BlogPost**: **[MISSING]** Required for `BlogPreview`.
  - Fields: `title`, `slug`, `excerpt`, `imageUrl`, `category`, `publishedAt`.
- **Video**: **[MISSING]** Required for `VideoGallery`.
  - Fields: `title`, `youtubeId`, `type` (FULL/SHORT), `category`.
- **Brand**: **[MISSING]** Required for `FeaturedBrands`.
  - Fields: `name`, `logoUrl`, `status`.

---

## 2. API Endpoints

The frontend components in this branch require the following endpoints to be fully functional:

### 2.1 Header & Navigation
| Endpoint | Component | Status |
| :--- | :--- | :--- |
| `GET /api/auth/me` | Side Drawer (Profile) | Exists |
| `GET /api/categories` | Shop Dropdown / Category Grid | Exists |
| `GET /api/products?search=` | Centered Search Bar | Exists |

### 2.2 Home Page Responsive Grids
| Endpoint | Component | Requirement |
| :--- | :--- | :--- |
| `GET /api/products` | Featured Products | Support `limit` and `featured` flags. |
| `GET /api/blogs` | Blog Preview | **[NEW]** Fetch latest 4 published posts. |
| `GET /api/videos` | Video Gallery | **[NEW]** Fetch full/short videos by type. |
| `GET /api/brands` | Featured Brands | **[NEW]** List active partner logos. |

---

## 3. Integration Priorities
1. **Search Logic**: Ensure the centered search bar in the header triggers a backend query that filters by product name and description.
2. **Slug-based Routing**: Ensure the backend returns `slug` for Categories and Products so the responsive links (`#/category/:slug`) remain SEO-friendly.
3. **Image Paths**: Ensure the API returns full URLs or consistent relative paths for product and category images to be rendered correctly in the grids.
