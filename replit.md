# PhoneStore - AY's Gadget Store

## Overview
A static HTML/CSS/JavaScript e-commerce marketplace for phones and gadgets. Supports browsing products (New, UK-Used, Nigeria-Used), cart management, checkout with Paystack payments, and an admin dashboard.

## Tech Stack
- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling:** Tailwind CSS (via CDN), custom `home.css`
- **Animations:** GSAP (via CDN)
- **Icons:** Font Awesome 6 (via CDN)
- **Database:** Firebase Firestore (real-time)
- **Auth:** Firebase Authentication (admin login)
- **Payments:** Paystack (Nigeria NGN)
- **Build System:** None (no-build static site)

## Project Structure
```
/
├── homepage.html     # Main landing page with hero slider and featured products
├── product.html      # Product catalog with tabs and search
├── cart.html         # Shopping cart and checkout with Paystack integration
├── admin.html        # Admin dashboard (inventory, hero slides, orders)
├── login.html        # Admin login page (placeholder)
├── home.css          # Custom CSS animations and utility overrides
├── test.html         # Empty test file
└── test2.html        # Test/scratch file
```

## Running the App
The app is served by Python's built-in HTTP server:
```
python3 -m http.server 5000 --bind 0.0.0.0
```

## Workflow
- **Start application** — serves the static files on port 5000

## Deployment
- **Type:** Static site
- **Public directory:** `.` (project root)

## Key Features
- Real-time cart synced via Firebase `onSnapshot` using `guestId` in localStorage
- CRUD admin dashboard for products, gadgets, and hero slides
- Drag-and-drop hero slide ordering (GSAP Draggable)
- Lagos LGA-based shipping fee calculation
- Paystack payment integration (NGN)

## Notes
- Firebase config is embedded directly in the HTML files
- No environment variables or build steps required
- All dependencies loaded from CDN
