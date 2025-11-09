---
mode: agent
---

# UI/UX Style Guide

## Overview

This style guide defines the visual design system for the B2B marketplace platform, focusing on professional aesthetics, trust-building elements, and accessibility. The design system is built on Tailwind CSS and shadcn/ui components, optimized for international B2B users with multi-language support.

## Design Principles

### 1. Professional & Trustworthy

- Clean, minimal design that conveys reliability
- Consistent use of verification badges and trust indicators
- Clear hierarchy and information architecture

### 2. Efficient & Task-Oriented

- Streamlined workflows for business users
- Quick access to critical actions (search, order, verify)
- Data-dense interfaces with proper spacing

### 3. Accessible & Inclusive

- WCAG 2.1 AA compliance minimum
- Support for multiple languages and RTL layouts
- High contrast ratios for text readability

### 4. Responsive & Adaptive

- Mobile-first approach for on-the-go business users
- Optimized layouts for tablets and desktop workstations
- Touch-friendly targets (minimum 44x44px)

## Color System

### Primary Palette

**Brand Colors - Professional Blue**

```javascript
// Conveys trust, stability, and professionalism
primary: {
  50: '#eff6ff',   // Lightest - backgrounds, hover states
  100: '#dbeafe',  // Very light - subtle backgrounds
  200: '#bfdbfe',  // Light - borders, disabled states
  300: '#93c5fd',  // Medium light - secondary elements
  400: '#60a5fa',  // Medium - interactive elements
  500: '#3b82f6',  // Base - primary buttons, links
  600: '#2563eb',  // Medium dark - hover states
  700: '#1d4ed8',  // Dark - active states
  800: '#1e40af',  // Darker - text on light backgrounds
  900: '#1e3a8a',  // Darkest - headings, emphasis
  950: '#172554',  // Extra dark - high contrast text
}
```

**Secondary Colors - Professional Slate**

```javascript
// For neutral elements, backgrounds, and text
secondary: {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
}
```

### Semantic Colors

**Success - Green (Verification, Completed Orders)**

```javascript
success: {
  50: '#f0fdf4',
  100: '#dcfce7',
  500: '#22c55e',  // Base
  600: '#16a34a',  // Hover
  700: '#15803d',  // Active
}
```

**Warning - Amber (Pending Actions)**

```javascript
warning: {
  50: '#fffbeb',
  100: '#fef3c7',
  500: '#f59e0b',  // Base
  600: '#d97706',  // Hover
  700: '#b45309',  // Active
}
```

**Error - Red (Rejections, Disputes)**

```javascript
error: {
  50: '#fef2f2',
  100: '#fee2e2',
  500: '#ef4444',  // Base
  600: '#dc2626',  // Hover
  700: '#b91c1c',  // Active
}
```

**Info - Sky Blue (Informational Messages)**

```javascript
info: {
  50: '#f0f9ff',
  100: '#e0f2fe',
  500: '#0ea5e9',  // Base
  600: '#0284c7',  // Hover
  700: '#0369a1',  // Active
}
```

### Background Colors

```javascript
background: {
  primary: '#ffffff',      // Main content background
  secondary: '#f8fafc',    // Secondary sections, cards
  tertiary: '#f1f5f9',     // Subtle backgrounds, hover states
  dark: '#0f172a',         // Dark mode primary
  darkSecondary: '#1e293b', // Dark mode secondary
}
```

### Border Colors

```javascript
border: {
  light: '#e2e8f0',        // Default borders
  medium: '#cbd5e1',       // Emphasized borders
  dark: '#94a3b8',         // Strong borders
  focus: '#3b82f6',        // Focus rings
}
```

## Typography

### Font Families

**Primary Font - Inter**

- Modern, professional sans-serif
- Excellent readability at all sizes
- Complete UTF-8 support including Cyrillic, Greek, Vietnamese
- Variable font for optimal performance

```javascript
fontFamily: {
  sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'Consolas', 'monospace'],
}
```

**Installation**

```html
<!-- In app layout or _document.tsx -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

**Alternative: System Font Stack (Faster Loading)**

```javascript
fontFamily: {
  sans: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
}
```

### Font Sizes & Line Heights

```javascript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px - captions, labels
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - small text, metadata
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px - body text
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px - large body, subtitles
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - section headings
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px - page headings
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - major headings
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px - hero headings
  '5xl': ['3rem', { lineHeight: '1' }],         // 48px - display text
}
```

### Font Weights

```javascript
fontWeight: {
  light: '300',      // Rarely used, large display text only
  normal: '400',     // Body text
  medium: '500',     // Emphasized text, labels
  semibold: '600',   // Subheadings, buttons
  bold: '700',       // Headings
  extrabold: '800',  // Hero text, major emphasis
}
```

### Typography Usage Guidelines

**Headings**

- H1: `text-3xl md:text-4xl font-bold text-slate-900`
- H2: `text-2xl md:text-3xl font-bold text-slate-900`
- H3: `text-xl md:text-2xl font-semibold text-slate-900`
- H4: `text-lg font-semibold text-slate-900`

**Body Text**

- Primary: `text-base font-normal text-slate-700`
- Secondary: `text-sm font-normal text-slate-600`
- Caption: `text-xs font-normal text-slate-500`

**Interactive Elements**

- Button Text: `text-sm md:text-base font-medium`
- Link Text: `text-sm md:text-base font-medium text-primary-600 hover:text-primary-700`
- Label Text: `text-sm font-medium text-slate-700`

## Spacing System

### Base Scale (Tailwind Default - 4px base unit)

```javascript
spacing: {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
}
```

### Spacing Usage Guidelines

**Component Padding**

- Small components (buttons, badges): `px-3 py-1.5` or `px-4 py-2`
- Medium components (cards, inputs): `p-4` or `p-6`
- Large components (sections, containers): `p-6 md:p-8` or `p-8 md:p-12`

**Component Gaps**

- Tight spacing (form fields): `gap-2` or `gap-3`
- Normal spacing (card grids): `gap-4` or `gap-6`
- Loose spacing (sections): `gap-8` or `gap-12`

**Section Margins**

- Between sections: `my-8 md:my-12` or `my-12 md:my-16`
- Page top/bottom: `py-8 md:py-12` or `py-12 md:py-16`

## Border Radius

```javascript
borderRadius: {
  none: '0',
  sm: '0.125rem',   // 2px - subtle rounding
  DEFAULT: '0.25rem', // 4px - default for most elements
  md: '0.375rem',   // 6px - cards, buttons
  lg: '0.5rem',     // 8px - larger cards, modals
  xl: '0.75rem',    // 12px - hero sections
  '2xl': '1rem',    // 16px - special elements
  '3xl': '1.5rem',  // 24px - very large elements
  full: '9999px',   // Pills, avatars
}
```

### Border Radius Usage

- Buttons: `rounded-md` (6px)
- Input fields: `rounded-md` (6px)
- Cards: `rounded-lg` (8px)
- Modals/Dialogs: `rounded-xl` (12px)
- Badges/Pills: `rounded-full`
- Images: `rounded-lg` (8px)

## Shadows

```javascript
boxShadow: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
}
```

### Shadow Usage

- Cards (default): `shadow-sm`
- Cards (hover): `shadow-md`
- Dropdowns/Popovers: `shadow-lg`
- Modals: `shadow-xl`
- Floating action buttons: `shadow-lg hover:shadow-xl`

## Complete Tailwind Configuration

```javascript
// tailwind.config.js
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

## CSS Variables (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 217.2 91.2% 59.8%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings:
      "rlig" 1,
      "calt" 1;
  }
}

/* Custom utility classes */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

## Component Styling Guidelines

### Buttons

**Primary Button**

```jsx
<button className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
  Primary Action
</button>
```

**Secondary Button**

```jsx
<button className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
  Secondary Action
</button>
```

**Destructive Button**

```jsx
<button className="inline-flex items-center justify-center rounded-md bg-error-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
  Delete
</button>
```

**Ghost Button**

```jsx
<button className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
  Ghost Action
</button>
```

### Input Fields

**Text Input**

```jsx
<input
  type="text"
  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
  placeholder="Enter text..."
/>
```

**Input with Label**

```jsx
<div className="space-y-2">
  <label className="text-sm font-medium text-slate-700">Company Name</label>
  <input
    type="text"
    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
  />
</div>
```

**Input with Error**

```jsx
<div className="space-y-2">
  <label className="text-sm font-medium text-slate-700">Email Address</label>
  <input
    type="email"
    className="block w-full rounded-md border border-error-500 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-error-500 focus:outline-none focus:ring-1 focus:ring-error-500"
  />
  <p className="text-sm text-error-600">Please enter a valid email address</p>
</div>
```

### Cards

**Basic Card**

```jsx
<div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-slate-900">Card Title</h3>
  <p className="mt-2 text-sm text-slate-600">Card content goes here</p>
</div>
```

**Interactive Card (Hover Effect)**

```jsx
<div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
  <h3 className="text-lg font-semibold text-slate-900">Product Name</h3>
  <p className="mt-2 text-sm text-slate-600">Product description</p>
</div>
```

**Card with Header**

```jsx
<div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
  <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
    <h3 className="text-lg font-semibold text-slate-900">Card Header</h3>
  </div>
  <div className="p-6">
    <p className="text-sm text-slate-600">Card content</p>
  </div>
</div>
```

### Badges

**Status Badges**

```jsx
// Verified
<span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-700">
  Verified
</span>

// Pending
<span className="inline-flex items-center rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-700">
  Pending
</span>

// Rejected
<span className="inline-flex items-center rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-medium text-error-700">
  Rejected
</span>

// Info
<span className="inline-flex items-center rounded-full bg-info-100 px-2.5 py-0.5 text-xs font-medium text-info-700">
  New
</span>
```

### Tables

**Data Table**

```jsx
<div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
  <table className="min-w-full divide-y divide-slate-200">
    <thead className="bg-slate-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
          Column 1
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
          Column 2
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-slate-200">
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
          Data 1
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
          Data 2
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Navigation

**Top Navigation Bar**

```jsx
<nav className="border-b border-slate-200 bg-white">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex h-16 items-center justify-between">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <img className="h-8 w-auto" src="/logo.svg" alt="Logo" />
        </div>
        <div className="hidden md:block ml-10">
          <div className="flex items-baseline space-x-4">
            <a
              href="#"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Products
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>
```

**Sidebar Navigation**

```jsx
<aside className="w-64 border-r border-slate-200 bg-white h-screen">
  <nav className="flex flex-col gap-1 p-4">
    <a
      href="#"
      className="flex items-center gap-3 rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700"
    >
      <svg className="h-5 w-5" />
      Dashboard
    </a>
    <a
      href="#"
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    >
      <svg className="h-5 w-5" />
      Products
    </a>
  </nav>
</aside>
```

### Modals/Dialogs

**Modal Overlay**

```jsx
<div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm">
  <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-slate-900">Modal Title</h2>
      <p className="mt-2 text-sm text-slate-600">Modal content</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md">
          Cancel
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">
          Confirm
        </button>
      </div>
    </div>
  </div>
</div>
```

### Alerts/Notifications

**Success Alert**

```jsx
<div className="rounded-md bg-success-50 border border-success-200 p-4">
  <div className="flex">
    <div className="flex-shrink-0">
      <svg className="h-5 w-5 text-success-600" />
    </div>
    <div className="ml-3">
      <h3 className="text-sm font-medium text-success-800">Success</h3>
      <p className="mt-1 text-sm text-success-700">
        Your changes have been saved.
      </p>
    </div>
  </div>
</div>
```

**Error Alert**

```jsx
<div className="rounded-md bg-error-50 border border-error-200 p-4">
  <div className="flex">
    <div className="flex-shrink-0">
      <svg className="h-5 w-5 text-error-600" />
    </div>
    <div className="ml-3">
      <h3 className="text-sm font-medium text-error-800">Error</h3>
      <p className="mt-1 text-sm text-error-700">
        There was a problem with your request.
      </p>
    </div>
  </div>
</div>
```

**Info Alert**

```jsx
<div className="rounded-md bg-info-50 border border-info-200 p-4">
  <div className="flex">
    <div className="flex-shrink-0">
      <svg className="h-5 w-5 text-info-600" />
    </div>
    <div className="ml-3">
      <h3 className="text-sm font-medium text-info-800">Information</h3>
      <p className="mt-1 text-sm text-info-700">
        Your profile is pending verification.
      </p>
    </div>
  </div>
</div>
```

## shadcn/ui Integration

### Installation

```bash
npx shadcn-ui@latest init
```

### Configuration Options

```
Would you like to use TypeScript? yes
Which style would you like to use? Default
Which color would you like to use as base color? Slate
Where is your global CSS file? app/globals.css
Would you like to use CSS variables for colors? yes
Where is your tailwind.config.js located? tailwind.config.js
Configure the import alias for components: @/components
Configure the import alias for utils: @/lib/utils
Are you using React Server Components? yes
```

### Recommended shadcn/ui Components

Install these components for the B2B marketplace:

```bash
# Core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar

# Form components
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add switch

# Navigation
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add breadcrumb

# Feedback
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert-dialog

# Data display
npx shadcn-ui@latest add table
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add progress

# Overlays
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add sheet

# Advanced
npx shadcn-ui@latest add command
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add data-table
```

### Custom Component Variants

**Button Variants (extend shadcn/ui button)**

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700",
        destructive: "bg-error-600 text-white hover:bg-error-700",
        outline:
          "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
        secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200",
        ghost: "hover:bg-slate-100 text-slate-700",
        link: "underline-offset-4 hover:underline text-primary-600",
        success: "bg-success-600 text-white hover:bg-success-700",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## Responsive Design Breakpoints

```javascript
screens: {
  'sm': '640px',   // Mobile landscape, small tablets
  'md': '768px',   // Tablets
  'lg': '1024px',  // Laptops, small desktops
  'xl': '1280px',  // Desktops
  '2xl': '1536px', // Large desktops
}
```

### Responsive Patterns

**Mobile-First Approach**

```jsx
// Stack on mobile, grid on larger screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// Hide on mobile, show on desktop
<div className="hidden md:block">
  {/* Desktop-only content */}
</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">
  {/* Mobile-only content */}
</div>

// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>
```

## Accessibility Guidelines

### Focus States

All interactive elements must have visible focus indicators:

```jsx
// Button focus
className =
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";

// Input focus
className = "focus:border-primary-500 focus:ring-1 focus:ring-primary-500";

// Link focus
className =
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded";
```

### Color Contrast

Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text):

- Primary text on white: `text-slate-900` (21:1 ratio) ✓
- Secondary text on white: `text-slate-600` (7:1 ratio) ✓
- Primary button text: White on `bg-primary-600` (4.6:1 ratio) ✓
- Success text: `text-success-700` on `bg-success-50` (7.2:1 ratio) ✓

### Semantic HTML

Use proper HTML elements for accessibility:

```jsx
// Use semantic elements
<nav>, <main>, <aside>, <header>, <footer>, <article>, <section>

// Proper heading hierarchy
<h1> → <h2> → <h3> (don't skip levels)

// Form labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Button vs Link
<button> for actions
<a> for navigation

// ARIA labels when needed
<button aria-label="Close dialog">
  <XIcon />
</button>
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

- Tab order follows visual order
- All actions accessible via keyboard
- Escape key closes modals/dropdowns
- Enter/Space activates buttons
- Arrow keys navigate menus/lists

## Animation & Transitions

### Transition Utilities

```javascript
// Tailwind transition classes
transition-none
transition-all
transition-colors
transition-opacity
transition-shadow
transition-transform

// Duration
duration-75
duration-100
duration-150
duration-200
duration-300
duration-500
duration-700
duration-1000

// Easing
ease-linear
ease-in
ease-out
ease-in-out
```

### Common Animations

**Hover Effects**

```jsx
// Button hover
className = "transition-colors duration-200 hover:bg-primary-700";

// Card hover
className = "transition-shadow duration-200 hover:shadow-md";

// Scale on hover
className = "transition-transform duration-200 hover:scale-105";
```

**Loading States**

```jsx
// Pulse animation
<div className="animate-pulse bg-slate-200 h-4 w-full rounded" />

// Spin animation (for loading spinners)
<svg className="animate-spin h-5 w-5 text-primary-600" />
```

**Fade In**

```jsx
// Using Tailwind
<div className="animate-in fade-in duration-300">Content</div>
```

### Performance Considerations

- Use `transition-colors` instead of `transition-all` when possible
- Prefer `transform` and `opacity` for animations (GPU accelerated)
- Keep animations under 300ms for snappy feel
- Use `will-change` sparingly for complex animations

## Icon System

### Recommended Icon Library

**Lucide React** (Modern, consistent, tree-shakeable)

```bash
npm install lucide-react
```

**Usage**

```jsx
import { Search, ShoppingCart, User, Check, X, AlertCircle } from 'lucide-react'

// Standard size (24px)
<Search className="h-5 w-5 text-slate-600" />

// Small size (16px)
<Check className="h-4 w-4 text-success-600" />

// Large size (32px)
<User className="h-8 w-8 text-slate-900" />
```

### Common Icons for B2B Marketplace

```jsx
// Navigation
import { Home, Search, ShoppingBag, Users, Settings, Bell } from "lucide-react";

// Actions
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  Download,
  Upload,
} from "lucide-react";

// Status
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

// Business
import {
  Package,
  Truck,
  CreditCard,
  FileText,
  Building2,
  MapPin,
} from "lucide-react";

// UI
import {
  ChevronDown,
  ChevronRight,
  Menu,
  MoreVertical,
  Filter,
  SortAsc,
} from "lucide-react";
```

## Loading States

### Skeleton Loaders

```jsx
// Card skeleton
<div className="rounded-lg border border-slate-200 bg-white p-6">
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    <div className="h-20 bg-slate-200 rounded"></div>
  </div>
</div>

// Table skeleton
<div className="space-y-3">
  {[...Array(5)].map((_, i) => (
    <div key={i} className="animate-pulse flex space-x-4">
      <div className="h-10 bg-slate-200 rounded flex-1"></div>
      <div className="h-10 bg-slate-200 rounded w-32"></div>
    </div>
  ))}
</div>
```

### Loading Spinners

```jsx
// Inline spinner
<svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>

// Button with loading state
<button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md opacity-50 cursor-not-allowed">
  <svg className="animate-spin h-4 w-4" />
  Loading...
</button>
```

## Form Validation Styles

### Input States

```jsx
// Default
<input className="border-slate-300 focus:border-primary-500 focus:ring-primary-500" />

// Success
<input className="border-success-500 focus:border-success-500 focus:ring-success-500" />

// Error
<input className="border-error-500 focus:border-error-500 focus:ring-error-500" />

// Disabled
<input disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
```

### Validation Messages

```jsx
// Error message
<p className="mt-1 text-sm text-error-600">
  This field is required
</p>

// Helper text
<p className="mt-1 text-sm text-slate-500">
  Enter your business email address
</p>

// Success message
<p className="mt-1 text-sm text-success-600">
  Email verified successfully
</p>
```

## Best Practices Summary

### Do's ✓

1. **Use consistent spacing** - Stick to the 4px base unit system
2. **Maintain color hierarchy** - Primary for actions, secondary for content
3. **Provide feedback** - Loading states, success/error messages, hover effects
4. **Optimize for touch** - Minimum 44x44px touch targets on mobile
5. **Use semantic HTML** - Proper elements for accessibility
6. **Test with real content** - Avoid lorem ipsum, use realistic B2B data
7. **Support keyboard navigation** - All actions accessible via keyboard
8. **Implement proper focus states** - Visible focus indicators on all interactive elements
9. **Use system fonts or web fonts** - Inter for professional look with UTF-8 support
10. **Follow mobile-first approach** - Design for mobile, enhance for desktop

### Don'ts ✗

1. **Don't use too many colors** - Stick to the defined palette
2. **Don't skip focus states** - Critical for accessibility
3. **Don't use small text** - Minimum 14px (text-sm) for body text
4. **Don't overuse animations** - Keep them subtle and purposeful
5. **Don't ignore loading states** - Always show feedback for async operations
6. **Don't use low contrast** - Ensure WCAG AA compliance minimum
7. **Don't break keyboard navigation** - Test all flows with keyboard only
8. **Don't use custom fonts without fallbacks** - Always provide system font fallbacks
9. **Don't ignore RTL languages** - Plan for internationalization from the start
10. **Don't use absolute units** - Use rem/em for scalability

## Multi-Language Support

### Font Stack for International Support

The Inter font family provides excellent support for:

- Latin (including extended)
- Cyrillic
- Greek
- Vietnamese

For additional language support, consider:

```javascript
fontFamily: {
  sans: [
    'Inter Variable',
    'Inter',
    // Arabic support
    'Noto Sans Arabic',
    // Chinese/Japanese/Korean
    'Noto Sans SC',
    'Noto Sans JP',
    'Noto Sans KR',
    // System fallbacks
    'system-ui',
    '-apple-system',
    'sans-serif',
  ],
}
```

### RTL (Right-to-Left) Support

```jsx
// Add dir attribute based on language
<html dir={locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr'}>

// Use logical properties in Tailwind
// Instead of: ml-4, mr-4
// Use: ms-4, me-4 (start/end)

// Tailwind RTL plugin
// npm install tailwindcss-rtl
```

### Text Rendering Optimization

```css
body {
  /* Optimize text rendering */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;

  /* Enable OpenType features */
  font-feature-settings:
    "rlig" 1,
    "calt" 1;
}
```

This comprehensive style guide provides everything needed to build a professional, accessible, and scalable B2B marketplace interface.
