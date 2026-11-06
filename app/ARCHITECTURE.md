# Fitoo Frontend Architecture Documentation

> **Project:** Fitoo
>
> **Framework:** Next.js 15 (App Router)
>
> **Language:** JavaScript (.jsx)
>
> **Styling:** Tailwind CSS + Ant Design
>
> **Architecture:** Atomic Design
>
> **Goal:** Build a scalable, maintainable, SEO-friendly fitness and nutrition platform.

---

# Tech Stack

- Next.js (App Router)
- React
- JavaScript (.jsx)
- Tailwind CSS
- Ant Design
- Framer Motion
- Axios
- React Hook Form
- Zod
- Redux Toolkit (planned)
- React Icons
- Day.js

---

# Folder Structure

```text
Fito/
│
├── app/                        # Next.js App Router
│   ├── (public)/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── globals.css
│   ├── layout.jsx
│   ├── loading.jsx
│   ├── error.jsx
│   ├── not-found.jsx
│   ├── robots.js
│   ├── sitemap.js
│   └── manifest.js
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   ├── logos/
│   ├── lottie/
│   ├── svg/
│   └── videos/
│
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   ├── layouts/
│   └── shared/
│
├── config/
├── constants/
├── context/
├── data/
├── hooks/
├── lib/
├── providers/
├── sections/
├── services/
├── store/
├── styles/
├── utils/
│
├── middleware.js
├── .env.local
├── .env.example
├── README.md
│
├── package.json
├── next.config.js
└── ...
```

---

# Folder Responsibilities

## app/

Contains only routing-related files.

Examples:

- page.jsx
- layout.jsx
- loading.jsx
- error.jsx
- not-found.jsx

The App Router should never contain large UI implementations.

Instead, pages should simply assemble sections.

Example:

```jsx
<HomeHero />
<FeaturedProducts />
<Testimonials />
<Footer />
```

---

## assets/

Stores every static asset.

```
fonts/
icons/
images/
logos/
svg/
videos/
lottie/
```

Examples

- Logo
- Hero images
- Product placeholders
- SVG icons
- Animation files

---

## components/

Contains reusable UI following Atomic Design.

---

### atoms/

Smallest UI building blocks.

Examples

- Button
- Input
- Typography
- Badge
- Spinner
- Divider
- Avatar
- Tag

Atoms contain no business logic.

---

### molecules/

Combination of atoms.

Examples

- Search Bar
- Product Price
- Rating
- Quantity Selector
- Breadcrumb
- Cart Item

---

### organisms/

Large reusable UI components.

Examples

- Navbar
- Hero
- Footer
- Product Grid
- Product Card
- Consultation Form
- FAQ Section

---

### templates/

Page templates.

Examples

- Product Template
- Dashboard Template
- Blog Template

---

### layouts/

Reusable layouts.

Examples

- Main Layout
- Dashboard Layout
- Authentication Layout

---

### shared/

Reusable components that don't naturally belong to Atomic Design.

Examples

- Logo
- Loader
- Empty State
- Error State
- SEO Component
- Protected Route

---

## config/

Application configuration.

Examples

- Axios configuration
- Ant Design theme
- Site configuration

Keeps configuration centralized.

---

## constants/

Stores values that rarely change.

Examples

- Routes
- API endpoints
- Regex
- Roles
- Colors
- Product Categories

Avoid hardcoding values throughout the project.

---

## context/

Contains React Context Providers.

Examples

- Theme Context
- Language Context
- Authentication Context

---

## data/

Temporary dummy data until backend integration.

Examples

- Products
- Categories
- Blogs
- FAQs
- Testimonials
- Notifications
- Orders

---

## hooks/

Reusable custom hooks.

Examples

- useAuth()
- useCart()
- useWishlist()
- useNotifications()
- useDebounce()

---

## lib/

Reusable application libraries.

Examples

- SEO helpers
- Metadata generators
- JSON-LD
- Breadcrumb generators

---

## providers/

Global providers.

Examples

- Ant Design ConfigProvider
- Redux Provider
- Theme Provider

Every provider is imported inside the root layout.

---

## sections/

Page-specific UI.

Unlike components, sections belong to one page.

Example

```
sections/home/

Hero.jsx

Categories.jsx

FeaturedProducts.jsx

Testimonials.jsx

Newsletter.jsx

CTA.jsx
```

Home page

```jsx
<HomeHero />
<Categories />
<FeaturedProducts />
<Testimonials />
<Newsletter />
```

---

## services/

Responsible for backend communication.

Components never call APIs directly.

Flow

```
Component

↓

Service

↓

Backend
```

Examples

- auth.service.js
- product.service.js
- consultation.service.js
- notification.service.js

---

## store/

Application state.

Will contain Redux Toolkit.

Separated by feature.

Examples

```
auth/

cart/

wishlist/

notification/

user/
```

---

## styles/

Contains additional styling.

Tailwind remains the primary styling solution.

---

## utils/

Pure helper functions.

Examples

- slugify()
- formatCurrency()
- truncate()
- debounce()
- validators()
- calculateDiscount()

Utilities should never contain UI.

---

# Atomic Design

Hierarchy

```
Atoms

↓

Molecules

↓

Organisms

↓

Templates

↓

Pages
```

Benefits

- Reusable
- Maintainable
- Scalable
- Easy testing
- Consistent design system

---

# Data Flow

```
Backend

↓

Services

↓

Redux Store

↓

Sections

↓

Organisms

↓

Molecules

↓

Atoms

↓

User Interface
```

---

# Project Philosophy

The project follows strict separation of concerns.

### Routing

app/

↓

### Sections

sections/

↓

### Reusable Components

components/

↓

### Business Logic

services/

↓

### State

store/

↓

### API

Backend

This keeps the application clean as it grows.

---

# Development Rules

## Components

Keep components focused on a single responsibility.

---

## Pages

Pages should only compose sections.

Avoid placing business logic inside pages.

---

## Services

Never call Axios directly inside components.

Always use services.

---

## Store

Global state belongs inside Redux.

Avoid unnecessary Context usage.

---

## Dummy Data

Develop using dummy data first.

Replace with APIs later without changing UI components.

---

## SEO

Every public page should support

- Dynamic Metadata
- Open Graph
- Twitter Cards
- Canonical URLs
- JSON-LD
- Sitemap
- Robots
- Dynamic Slugs

SEO should be driven by data coming from the Admin Panel whenever possible.

---

## Performance Goals

- Lighthouse Performance ≥ 95
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO = 100

---

# UI Principles

The interface should feel

- Premium
- Fast
- Modern
- Minimal
- Interactive

Animations should be subtle.

Focus on performance over excessive visual effects.

---

# Vision

Fitoo is designed to become a complete fitness ecosystem combining premium supplement e-commerce with personalized diet consultation.

The architecture emphasizes scalability, clean code, maintainability, performance, accessibility, and SEO so the project can grow without requiring major structural changes.