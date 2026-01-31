# Framework-specific Fix Guide

This document explains specific fix techniques for each framework and styling method.

---

## Hugo + Tailwind CSS v4 + DaisyUI (CookBook Project)

### Project-Specific Conventions

**CRITICAL**: Always use the `asset-url.html` partial for asset URLs:

```html
<!-- ❌ WRONG: Hardcoded path -->
<img src="/images/recipe.jpg">
<link href="/css/style.css">

<!-- ✅ CORRECT: Using asset-url partial -->
<img src="{{ partial \"asset-url.html\" \"/images/recipe.jpg\" }}">
<link href="{{ partial \"asset-url.html\" \"/css/style.css\" }}">
```

### Fixing Recipe Card Images

```html
<!-- layouts/partials/summary.html -->

<!-- ❌ BEFORE: Inconsistent card images -->
<div class="card">
  <img src="{{ .Params.recipe_image }}" alt="{{ .Title }}">
</div>

<!-- ✅ AFTER: Square images with proper aspect ratio -->
<div class="card">
  <div class="aspect-square overflow-hidden">
    <img 
      src="{{ partial \"asset-url.html\" .Params.recipe_image }}"
      alt="{{ .Title }}"
      class="w-full h-full object-cover"
      loading="lazy"
    >
  </div>
</div>
```

### Fixing Hero Images (Single Recipe Page)

```html
<!-- layouts/_default/single.html -->

<!-- ❌ BEFORE: Hero image with lazy loading (bad LCP) -->
<img 
  src="{{ .Params.recipe_image }}"
  loading="lazy"
>

<!-- ✅ AFTER: Priority loading for LCP optimization -->
<img 
  src="{{ partial \"asset-url.html\" .Params.recipe_image }}"
  alt="{{ .Title }}"
  class="w-full h-auto object-cover recipe-hero-image"
  fetchpriority="high"
>
```

### Fixing Layout with Hugo Templates

```html
<!-- layouts/_default/baseof.html -->

<!DOCTYPE html>
<html lang="pl">
<head>
  {{ partial "head.html" . }}
</head>
<body class="min-h-screen flex flex-col">
  {{ partial "navbar.html" . }}
  
  <main class="flex-1 container mx-auto px-4 py-8">
    {{ block "main" . }}{{ end }}
  </main>
  
  {{ partial "footer.html" . }}
</body>
</html>
```

### Fixing Recipe Grid Layout

```html
<!-- layouts/index.html -->

<!-- ❌ BEFORE: Fixed column count -->
<div class="grid grid-cols-4 gap-4">
  {{ range .Pages }}
    {{ partial "summary.html" . }}
  {{ end }}
</div>

<!-- ✅ AFTER: Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
  {{ range .Pages }}
    {{ partial "summary.html" . }}
  {{ end }}
</div>
```

### Adding Tailwind v4 Styles

```css
/* assets/css/main.css */

/* Import Tailwind base */
@import "tailwindcss";

/* Custom recipe card styles */
.recipe-card {
  @apply rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105;
}

/* Hero image container */
.recipe-hero {
  @apply relative w-full h-64 md:h-96 overflow-hidden;
}

.recipe-hero-image {
  @apply w-full h-full object-cover;
}

/* FODMAP badge */
.fodmap-badge {
  @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold;
  @apply bg-green-100 text-green-800;
}

/* Media badge (video indicator) */
.media-badge {
  @apply absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-full;
  @apply flex items-center gap-2 shadow-lg;
}
```

### Fixing Legacy CSS (When Needed)

```css
/* static/css/custom.css */

/* Hide draft recipes */
[data-draft="true"] {
  display: none !important;
}

/* Recipe card square images (legacy support) */
.recipe-card-image {
  aspect-ratio: 1 / 1;
  object-fit: cover;
  width: 100%;
}

/* Stats display */
.recipe-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
}

.recipe-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  min-width: 80px;
}
```

### Fixing Video Modals

```html
<!-- layouts/_default/single.html -->

{{ if .Params.link }}
<div class="video-section mt-8">
  <button 
    onclick="openVideoModal('{{ .Params.link }}')"
    class="btn btn-primary flex items-center gap-2"
  >
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
    </svg>
    {{ i18n "watchVideo" }}
  </button>
</div>

<!-- Modal structure -->
<div id="videoModal" class="modal">
  <div class="modal-box max-w-4xl">
    <div class="aspect-video">
      <iframe 
        id="videoFrame"
        class="w-full h-full"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>
    <div class="modal-action">
      <button class="btn" onclick="closeVideoModal()">
        {{ i18n "close" }}
      </button>
    </div>
  </div>
</div>
{{ end }}
```

### Fixing FODMAP Badge Display

```html
<!-- layouts/partials/summary.html -->

{{ if .Params.fodmap }}
  {{ if eq .Params.fodmap.status "low" }}
    <span class="badge badge-success">
      {{ i18n "lowFodmap" }}
    </span>
  {{ else if eq .Params.fodmap.status "high" }}
    <span class="badge badge-error">
      {{ i18n "highFodmap" }}
    </span>
  {{ end }}
{{ end }}
```

### Fixing Rating Display

```html
<!-- layouts/partials/summary.html -->

{{ if .Params.rating }}
<div class="flex items-center gap-1">
  {{ range seq 1 5 }}
    {{ if le . $.Params.rating }}
      <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
      </svg>
    {{ else }}
      <svg class="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
      </svg>
    {{ end }}
  {{ end }}
  <span class="text-sm text-gray-600 ml-1">
    ({{ .Params.rating }}/5)
  </span>
</div>
{{ end }}
```

### Using DaisyUI Components

```html
<!-- Card with DaisyUI -->
<div class="card bg-base-100 shadow-xl">
  <figure class="aspect-square">
    <img 
      src="{{ partial \"asset-url.html\" .Params.recipe_image }}"
      alt="{{ .Title }}"
      class="object-cover"
    >
  </figure>
  <div class="card-body">
    <h2 class="card-title">{{ .Title }}</h2>
    <p>{{ .Params.tagline }}</p>
    <div class="card-actions justify-end">
      <a href="{{ .RelPermalink }}" class="btn btn-primary">
        {{ i18n "viewRecipe" }}
      </a>
    </div>
  </div>
</div>

<!-- Alert with DaisyUI -->
<div class="alert alert-info">
  <svg class="stroke-current shrink-0 w-6 h-6" fill="none" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
  <span>{{ i18n "infoMessage" }}</span>
</div>

<!-- Badge with DaisyUI -->
<div class="badge badge-primary">{{ .Type }}</div>
<div class="badge badge-secondary">{{ .ReadingTime }} min</div>
```

### Responsive Testing for Hugo Site

```html
<!-- Mobile-first responsive utilities -->
<div class="
  p-4 sm:p-6 md:p-8
  text-sm sm:text-base md:text-lg
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
  gap-4 md:gap-6 lg:gap-8
">
  <!-- Content -->
</div>
```

---

## Pure CSS / SCSS

### Fixing Layout Overflow

```css
/* Before: Overflow occurs */
.container {
  width: 100%;
}

/* After: Control overflow */
.container {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
```

### Text Clipping Prevention

```css
/* Single line truncation */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Multi-line truncation */
.text-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Word wrapping */
.text-wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
```

### Spacing Unification

```css
/* Unify spacing with CSS custom properties */
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}

.card {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}
```

### Improving Contrast

```css
/* Before: Insufficient contrast */
.text {
  color: #999999;
  background-color: #ffffff;
}

/* After: Meets WCAG AA standards */
.text {
  color: #595959; /* Contrast ratio 7:1 */
  background-color: #ffffff;
}
```

---

## Tailwind CSS

### Layout Fixes

```jsx
{/* Before: Overflow */}
<div className="w-full">
  <img src="..." />
</div>

{/* After: Overflow control */}
<div className="w-full max-w-full overflow-hidden">
  <img src="..." className="w-full h-auto object-contain" />
</div>
```

### Text Clipping Prevention

```jsx
{/* Single line truncation */}
<p className="truncate">Long text...</p>

{/* Multi-line truncation */}
<p className="line-clamp-3">Long text...</p>

{/* Allow wrapping */}
<p className="break-words">Long text...</p>
```

### Responsive Support

```jsx
{/* Mobile-first responsive */}
<div className="
  flex flex-col gap-4
  md:flex-row md:gap-6
  lg:gap-8
">
  <div className="w-full md:w-1/2 lg:w-1/3">
    Content
  </div>
</div>
```

### Spacing Unification (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
}
```

### Accessibility Improvements

```jsx
{/* Add focus state */}
<button className="
  bg-blue-500 text-white
  hover:bg-blue-600
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
">
  Button
</button>

{/* Improve contrast */}
<p className="text-gray-700 bg-white"> {/* Changed from text-gray-500 */}
  Readable text
</p>
```

---

## React + CSS Modules

### Fixes in Module Scope

```css
/* Component.module.css */

/* Before */
.container {
  display: flex;
}

/* After: Add overflow control */
.container {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  max-width: 100%;
}
```

### Component-side Fixes

```jsx
// Component.jsx
import styles from './Component.module.css';

// Before
<div className={styles.container}>

// After: Add conditional class
<div className={`${styles.container} ${isOverflow ? styles.overflow : ''}`}>
```

---

## styled-components / Emotion

### Style Fixes

```jsx
// Before
const Container = styled.div`
  width: 100%;
`;

// After
const Container = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;
```

### Responsive Support

```jsx
const Card = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;
```

### Consistency with Theme

```jsx
// theme.js
export const theme = {
  colors: {
    primary: '#2563eb',
    text: '#1f2937',
    textLight: '#4b5563', // Improved contrast
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
  },
};

// Usage
const Text = styled.p`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;
```

---

## Vue (Scoped Styles)

### Fixing Scoped Styles

```vue
<template>
  <div class="container">
    <p class="text">Content</p>
  </div>
</template>

<style scoped>
/* Applied only to this component */
.container {
  max-width: 100%;
  overflow: hidden;
}

.text {
  /* Fix: Improve contrast */
  color: #374151; /* Was: #9ca3af */
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}
</style>
```

### Deep Selectors (Affecting Child Components)

```vue
<style scoped>
/* Override child component styles (use cautiously) */
:deep(.child-class) {
  margin-bottom: 1rem;
}
</style>
```

---

## Next.js / App Router

### Global Style Fixes

```css
/* app/globals.css */
:root {
  --foreground: #171717;
  --background: #ffffff;
}

/* Prevent layout overflow */
html, body {
  max-width: 100vw;
  overflow-x: hidden;
}

/* Prevent image overflow */
img {
  max-width: 100%;
  height: auto;
}
```

### Fixes in Layout Components

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50">
          {/* Header */}
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer>
          {/* Footer */}
        </footer>
      </body>
    </html>
  );
}
```

---

## Common Patterns

### Fixing Flexbox Layout Issues

```css
/* Before: Items overflow */
.flex-container {
  display: flex;
  gap: 1rem;
}

/* After: Wrap and size control */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.flex-item {
  flex: 1 1 300px; /* grow, shrink, basis */
  min-width: 0; /* Prevent flexbox overflow issues */
}
```

### Fixing Grid Layout Issues

```css
/* Before: Fixed column count */
.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

/* After: Auto-adjust */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

### Organizing z-index

```css
/* Systematize z-index */
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-tooltip: 500;
}

.modal {
  z-index: var(--z-modal);
}
```

### Adding Focus States

```css
/* Add focus state to all interactive elements */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Customize focus ring */
.custom-focus:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.5);
}
```

---

## Debugging Techniques

### Visualizing Element Boundaries

```css
/* Use only during development */
* {
  outline: 1px solid red !important;
}
```

### Detecting Overflow

```javascript
// Run in console to detect overflow elements
document.querySelectorAll('*').forEach(el => {
  if (el.scrollWidth > el.clientWidth) {
    console.log('Horizontal overflow:', el);
  }
  if (el.scrollHeight > el.clientHeight) {
    console.log('Vertical overflow:', el);
  }
});
```

### Checking Contrast Ratio

```javascript
// Use Chrome DevTools Lighthouse or axe DevTools
// Or check at the following site:
// https://webaim.org/resources/contrastchecker/
```