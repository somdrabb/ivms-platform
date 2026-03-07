# POS Module

This folder is a self-contained point-of-sale kiosk experience that drives the `/pos.html` page.

## Structure
- `pos.html`: single-page layout describing the lock-screen, POS view, overlays, toast, keyboard, buttons, and product display regions. It pulls in FontAwesome, `pos.css`, and `pos.js`.
- `pos.css`: styling for the two-column POS layout, modal overlays, buttons, keyboard, and responsive 100vh fixes.
- `pos.js`: drives every behavior (lock-screen, fullscreen toggle, keyboard, slideshow, product management, overlays, modals, session handling, and small helpers). The script is loaded at the bottom of `pos.html` and targets IDs/classes declared there.
- `public/asset/`: stores the slideshow/lock-screen images (`1.jpeg`, `2.jpeg`, `3.jpeg`). Update the paths in `pos.html` if you add or rename assets.

## Flow
1. **Lockscreen**: Initial view (`#view-lock`) renders the lock-screen slideshow and a soft numeric keyboard. Users authenticate via hardcoded credentials (`34024742`) and the login button only shows when required inputs are filled. The state is kept in localStorage keys `POS_SESSION_ACTIVE` and `POS_SESSION_USER` so a subsequent unlock can skip entering the user again.
2. **POS View**: After login, `#view-pos` shows the register. The left column has a slideshow banner (three images) plus product information. The right column simulates a numeric keypad, category buttons, and controls for quantity, PLU/EAN entry, storno, etc. User input is mirrored in `inputDisplay`, while scanned items are tracked in the `scannedItems` array.
3. **Overlays/Modals**: Various modals (basket lookup, admin confirmation, obst overlay, toast messages) are pre-rendered in HTML and toggled via JavaScript. Buttons such as `obstButton`, `logoutBtn`, and `articleSearchBtn` are already wired to DOM listeners in `pos.js`.
4. **Utility helpers**: `pos.js` calculates responsive measurements, handles fullscreen toggling, rotates slideshows, formats currency (`Intl.NumberFormat`), and safely interacts with `localStorage`.

## Data & Persistence
- **In-memory**: The current product list, total sum, toast messages, and overlay states all live in JS memory (`scannedItems`, `overlayState`, etc.). There is no active database or API wiring inside this module.
- **Session tracking**: Local storage is used to remember whether a session is active (`POS_SESSION_ACTIVE`) and to prefill the user ID (`POS_SESSION_USER`). `lockMode` toggles between requiring both user+password (`full`) and only password (`password-only`).
- **Number formatting**: Currency values use German locale formatting but strip currency symbols before display to `productTotalSum`.

## Connecting to a Database or API
This module currently mocks all data client-side. To connect it to a real backend:
1. Replace the hardcoded `VALID_USER`/`VALID_PASS` comparison inside `tryLogin()` with a fetch/POST to your authentication service; store the returned user ID in `currentUserId` and keep the session token in `safeSet`/`localStorage`.
2. Hook `scannedItems` updates to backend calls (`fetch` or sockets) when a new SKU is entered. Emit `POST /transactions` or the equivalent so totals are backed by the database and persisted.
3. Substitute the `lookupPopup` logic with actual product lookups via your product API. Populate `lookupPopupDetail`/`lookupPopupPrice` using the response data.
4. Consider extracting the overlay/button handlers (e.g., `obstButton`, `storno`) into named functions that call shared service modules once the backend is ready.

## Notes
- All scripts assume the POS runs in a browser that supports modern DOM APIs (fullscreen, orientation change, `classList`, etc.).
- The module presently uses German UI text (e.g., `Storno`, `Bon Abbruch`). Adjust the copy in `pos.html` and/or CSS as needed.
- If you add additional assets, expand `pos/public/asset` and update both the lock-screen and slideshow image paths in `pos.html`.
