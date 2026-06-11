# EdgeProbe

A high-performance, full-stack asset analysis tool built on Nuxt 3/4, TypeScript, and Tailwind CSS. Proactively inspect public resource URLs to retrieve detailed response headers, cache status, MIME attributes, security headers, and view inline previews.

## Features

- **Multi-Format URL Inspection**: Paste any public HTTP/HTTPS asset URL to inspect headers and extract server metrics. Includes robust loopback and private network blocking for security.
- **Header & Security Auditing**: Detailed key-value inspection tab alongside a dedicated Security Audit checklist evaluating Cache-Control, ETag, CDN Cache Status, CORS origins, and OWASP recommendations.
- **Dynamic Content Previews**:
  - Images (`image/*`) rendered inline with auto-calculating resolution dimensions.
  - Video (`video/*`) streamed via HTML5 playback engine.
  - Formatted JSON (`application/json`) with custom regex token syntax highlighting.
  - Plain Text / Code snippets showing line numbers for the first 100 lines.
  - Fallback descriptors for binary, PDF, and unknown assets.
- **Copy Utilities**: One-click clipboard generators for direct URLs, Markdown image tags, HTML image tags, and `curl` diagnostics commands. Stacked vertically to prevent layout shifts.
- **Premium Design System**: Sleek, minimalist dark mode UI with a zinc color palette, backdrop blurs, and Inter & JetBrains Mono typography.

---

## Technical Architecture

The application is structured as a full-stack Nuxt application, leveraging server-side API routes for proxy fetching to bypass browser Cross-Origin Resource Sharing (CORS) limits on inspected files:

```
├── app/
│   ├── components/      # Vue Components (UrlInput, MetadataPanel, HeadersPanel, etc.)
│   ├── composables/     # State management (useFileInspector.ts)
│   ├── types/           # Type definitions (types.ts)
│   └── app.vue          # Application entry point
├── server/
│   └── api/
│       └── inspect.ts   # Edge-compatible server inspector endpoint
├── public/              # Static assets (Favicons, assets)
├── nuxt.config.ts       # Nuxt configuration (SEO, fonts, Tailwind module)
└── tailwind.config.js   # Tailwind custom theme styles
```

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (LTS recommended).

### Install Dependencies

```bash
npm install
```

### Development Server

Start the hot-reloading development server:

```bash
npm run dev
```
By default, the server runs on `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

### Production Build

Build the server and client bundles for deployment:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---