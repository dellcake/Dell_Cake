# Debugging Report: Mobile Layout Shift and Hero Distortion on Page Load

## 1. Responsible Files
*   `index.html` (HTML structure of the Hero image)
*   `css/style.css` (CSS styling and viewport boundaries)
*   `js/banners.js` & `js/home-gallery.js` (Dynamic Supabase data injection timelines)

## 2. Responsible Functions / Events
*   **Asset Loading Event (`window.onload` / Image Load):** Recalculates the height of `.hero-artist-img` once the heavy 8.4-megapixel uncompressed PNG (`images/hero/baker-girl.png`) completes loading over the network.
*   **Viewport Scaling Event (Mobile Browser Engine Sizing):** Triggered by Android Chrome and iOS Safari when absolute positioned child elements (`.floating-bubble.fb1` and `.floating-bubble.fb2`) overflow the narrow viewport width during their CSS hover or animate-reveal state, causing the browser to auto-scale/zoom the page layout.

## 3. Modified Elements
*   `<img>` class `.hero-artist-img` (Height scales from 0px to ~296px after 1 second).
*   `<div>` class `.hero-right-image` (Height reflows to accommodate the loaded image, shifting adjacent grid layouts).
*   `<div>` class `.bento-banners-grid` (Transitions from 0px height loading skeletons to a ~1000px height filled grid).

## 4. Modified CSS Properties (Post-Load recalculation)
*   `height` of `.hero-artist-img` (from `0px` to `auto` which resolves to `296px` on standard mobile screens).
*   `viewport scale` (the browser alters the global mobile zoom factor to fit the overflowing absolute margins).

## 5. Timeline of the Layout Breakdown
1.  **Initial Render (Correct Layout):** The browser parses the CSS. The layout fits the mobile viewport perfectly because the un-downloaded image has `0px` height and absolute elements have not overflowed yet.
2.  **Asset Load & Skeletons Replace (0.5 - 1s later):**
    *   The heavy `images/hero/baker-girl.png` completes downloading. Since the HTML `<img>` tag lacks explicit `width` and `height` dimensions, the browser has to perform a late layout reflow (Layout Shift) to fit the image.
    *   Dynamic banners are fetched from Supabase and replace the `0px` height skeletons, compounding the layout reflow.
    *   Floating bubbles (`.floating-bubble`) with relative negative margins (`left: -5%`, `right: -2%`) overflow the left and right mobile screen boundaries.
3.  **Breakdown & Auto-Zoom (Immediately after):** Sizing calculations conflict with the viewport boundary. Chrome and Safari force an auto-zoom-to-fit recalculation, blowing up the Hero size and distorting the page layout.
