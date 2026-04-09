# AY's Gadget Store

## Overview
A premium Nigerian phone & gadget e-commerce marketplace. Customers can browse phones (New, UK-Used, Nigeria-Used) and gadgets, manage a real-time cart, and checkout with Paystack. Includes an admin dashboard for managing inventory, hero slides, and orders.

## Tech Stack
- **Frontend:** React 18 + Vite 6 + TailwindCSS 3
- **Routing:** React Router DOM v6
- **Fonts:** Syne (headings/display), Inter (body) — via Google Fonts
- **Icons:** Font Awesome 6 (CDN)
- **Database:** Firebase Firestore (real-time)
- **Auth:** Firebase Authentication (admin login)
- **Payments:** Paystack (Nigeria NGN)
- **Build:** Vite (npm run dev / npm run build)

## Project Structure
```
/
├── index.html              # Vite entry point (loads Google Fonts, FA icons, Paystack)
├── vite.config.js          # Vite config (port 5000, host 0.0.0.0, allowedHosts: all)
├── tailwind.config.js      # TailwindCSS config with custom color palette
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx            # React entry
    ├── App.jsx             # Router + providers
    ├── index.css           # Global styles, Tailwind directives, animations
    ├── firebase.js         # Firebase app + db + auth exports
    ├── context/
    │   ├── CartContext.jsx      # Real-time cart (Firebase onSnapshot)
    │   └── NotificationContext.jsx  # Toast notification system
    ├── pages/
    │   ├── HomePage.jsx         # Hero slider + categories + product/gadget grids
    │   ├── ProductsPage.jsx     # Full catalog with tabs + search
    │   ├── CartPage.jsx         # Cart + multi-step checkout + Paystack
    │   ├── AdminPage.jsx        # Admin dashboard (products, gadgets, hero, orders)
    │   └── LoginPage.jsx        # Firebase auth login
    └── components/
        ├── Navbar.jsx           # Fixed top nav with cart badge
        ├── MiniCart.jsx         # Slide-in cart drawer
        ├── ProductCard.jsx      # Premium product card
        ├── HeroSlider.jsx       # Auto-playing hero banner
        ├── ProductModal.jsx     # Product detail popup
        ├── NotificationContainer.jsx  # Toast notifications
        └── Footer.jsx           # Dark footer
```

## Pages & Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing, hero, featured products/gadgets |
| `/products` | ProductsPage | Full catalog with tabs and search |
| `/cart` | CartPage | Cart view + shipping + Paystack checkout |
| `/admin` | AdminPage | Admin dashboard (requires Firebase auth) |
| `/login` | LoginPage | Admin login |

## Running the App
```
npm run dev    # Dev server on port 5000
npm run build  # Production build → dist/
```

## Workflow
- **Start application** — Vite dev server on port 5000 (host 0.0.0.0)

## Deployment
- **Type:** Static (Vite build → dist/)
- **Build command:** `npm run build`
- **Public directory:** `dist`

## Design System
- **Color palette:** Deep Space (#0A0F1E) background + Electric Orange (#FF5C00) accent
- **Typography:** Syne (font-display class) for headings, Inter for body text
- **Border radius:** xl/2xl (rounded-xl, rounded-2xl) throughout
- **Shadows:** Custom glow and soft shadows via Tailwind config

## Key Features
- Real-time cart synced via Firebase `onSnapshot` using `guestId` in localStorage
- CRUD admin dashboard for products, gadgets, and hero slides
- Lagos LGA-based shipping fee calculation
- Paystack payment integration (NGN)
- Animated hero slider with pause/play
- Skeleton loading states
- Toast notification system

## Firebase Config
Embedded in `src/firebase.js` (project: ay-s-gadget).

## Notes
- Old HTML files (homepage.html, product.html, cart.html, admin.html) are legacy — the React app replaces them
- Firebase config is in src/firebase.js
- Paystack key needs to be updated with a real public key for payments to work
