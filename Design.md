# Devyx — Design System & UI/UX Specification

## 1. Brand Core & Anti-AI Aesthetic Rules
Devyx operates in **Web Development & Workflow Automation**[cite: 1, 2]. The visual identity must reflect precision engineering, deterministic execution, and architectural clarity. It must actively reject generic AI-generated SaaS tropes.

### Strict Prohibitions (Anti-AI Rules)
* **NO Glowing Background Orbs:** Never use large, blurred radial gradients (`filter: blur(80px+)`) floating behind content.
* **NO Gradient Typography:** Never apply `background-clip: text` gradients to headings or body text. All typography must use solid, high-contrast tokens.
* **NO Glassmorphism Overuse:** Avoid arbitrary `backdrop-filter: blur()` on cards. Use solid architectural surfaces with crisp `1px` structural borders.
* **NO Generic Rounded Pill Layouts:** Avoid bubbly `24px+` border radii. Use sharp corners (`0px` to `4px`) or 45-degree chamfered cuts inspired by the custom notches in the **Devyx** wordmark ('D', 'y', 'x')[cite: 1, 2].
* **NO Stock AI Illustrations:** Do not use isometric 3D robots or abstract floating spheres. Every visual element must be a functional diagram, live code snippet, or node-based automation pipeline.

---

## 2. Color System & Theme Tokens

The palette is derived from the flat-vector overlapping ribbon logo (Deep Cobalt to Electric Cyan) and adapts strictly across Dark and Light modes to maintain WCAG AA/AAA contrast[cite: 2].

```css
:root {
  /* LIGHT MODE — Matte Engineering Paper */
  --bg-primary: #F4F6F9;        /* Main canvas background */
  --bg-surface: #FFFFFF;        /* Card & module surface */
  --bg-elevated: #E9EEF5;       /* Secondary interactive surface / code blocks */
  
  --text-primary: #0B101E;      /* Deep navy ink (matches logo wordmark in light mode) */
  --text-secondary: #4A5568;    /* Muted slate (matches WEB & AUTOMATION subtitle) */
  --text-muted: #718096;        /* Technical metadata & coordinates */
  
  --accent-primary: #1B3B9B;    /* Deep Cobalt for high-contrast primary actions & links */
  --accent-secondary: #00B4D8;  /* Stepped-down Cyan for secondary highlights & active nodes */
  --accent-signal: #00E0FF;     /* Pure Electric Cyan (used only inside dark badges or ribbon paths) */
  
  --border-grid: #CBD5E1;       /* Exposed 1px structural grid lines */
  --border-focus: #1B3B9B;      /* Active card/input border */
  
  --status-operational: #10B981;
  --status-warning: #F59E0B;
  --status-error: #EF4444;
}

[data-theme="dark"] {
  /* DARK MODE — Industrial Control Room (Default) */
  --bg-primary: #0B101E;        /* Core obsidian navy from logo background */
  --bg-surface: #11182B;        /* Card & module surface */
  --bg-elevated: #172038;       /* Hover states & nested nodes */
  
  --text-primary: #F2F5F8;      /* Crisp glacial white (matches Devyx wordmark) */
  --text-secondary: #8A94A6;    /* Muted steel blue (matches WEB & AUTOMATION subtitle) */
  --text-muted: #5A657D;        /* Inactive labels & grid coordinates */
  
  --accent-primary: #00E0FF;    /* Electric Cyan from infinity ribbon apex */
  --accent-secondary: #2541B2;  /* Royal Cobalt from ribbon base */
  --accent-signal: #00E0FF;     /* Active data flow pulse */
  
  --border-grid: #1E2942;       /* Exposed 1px structural grid lines */
  --border-focus: #00E0FF;      /* Active card/input border */
}
```

### Logo Adaptation Rules
* **Icon:** Remains consistent across both modes using the flat-vector overlapping ribbon with razor-thin background-colored cutout gaps at intersections[cite: 2].
* **Wordmark (`Devyx`):** Uses `#F2F5F8` in Dark Mode and `#0B101E` in Light Mode[cite: 2].
* **Subtitle (`WEB & AUTOMATION`):** Uses `#8A94A6` in Dark Mode and `#4A5568` in Light Mode[cite: 2].

---

## 3. Typography

The typographic hierarchy pairs geometric structural display fonts with wide-tracked monospace technical labels[cite: 2].

```css
:root {
  --font-display: 'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif;
  --font-sans: 'Plus Jakarta Sans', 'IBM Plex Sans Arabic', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Type Scale & Rules
* **H1 (Hero Display):** `clamp(2.5rem, 5vw, 4.25rem)` | `font-weight: 700` | `line-height: 1.08` | `letter-spacing: -0.03em` (English) / `0` (Arabic).
* **H2 (Section Architecture):** `clamp(1.75rem, 3.5vw, 2.75rem)` | `font-weight: 700` | `line-height: 1.15` | `letter-spacing: -0.02em`.
* **H3 (Module Title):** `1.25rem` (`20px`) | `font-weight: 600` | `line-height: 1.3`.
* **Body Copy:** `1rem` (`16px`) to `1.125rem` (`18px`) | `font-weight: 400` | `line-height: 1.65` | Max width `65ch`.
* **Technical Labels & Eyebrows (Monospace):** `0.75rem` (`12px`) | `font-family: var(--font-mono)` | `text-transform: uppercase` | `letter-spacing: 0.2em` (mirrors the `WEB & AUTOMATION` tracking in the logo)[cite: 1, 2].

---

## 4. Layout & Exposed Structural Grid

The layout uses an **Exposed Blueprint Grid** where containers share visible `1px` borders rather than floating in empty space.

* **Max Container Width:** `1360px`, centered, bounded by left and right `1px solid var(--border-grid)` vertical rails.
* **Section Dividers:** Full-viewport-width (`100vw`) horizontal `1px solid var(--border-grid)` lines separating every major section.
* **Grid Crosshairs:** Place an `8px × 8px` `+` crosshair symbol (`color: var(--text-muted)`) at the exact intersection of vertical container rails and horizontal section dividers.
* **Hero Layout:** Strictly asymmetric 12-column split (7 columns for value proposition, technical metrics, and CTAs; 5 columns for an interactive live node/workflow visualizer). Never center-align the hero section.

---

## 5. Component Specifications

### A. Primary & Secondary Buttons (Chamfered Geometry)
Buttons reject rounded pill shapes in favor of a 45-degree chamfered bottom-right corner echoing the diagonal cuts in the logo wordmark[cite: 1, 2].

```css
.btn-primary {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 14px 28px;
  background-color: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease;
}

.btn-primary:hover {
  transform: translate(-2px, -2px);
  /* Accompanied by a solid 1px offset wireframe border underneath */
}
```

### B. Service & Case Study Cards
* **Structure:** Zero drop-shadow (`box-shadow: none`). Background `var(--bg-surface)`, border `1px solid var(--border-grid)`.
* **Technical Header Bar:** Every card features a top bar (`height: 36px`, `border-bottom: 1px solid var(--border-grid)`, `padding: 0 16px`) containing:
  * Left: Index coordinate in monospace (e.g., `SYS_01 // WEB_ARCH`).
  * Right: Live performance metric badge (e.g., `LCP < 0.8s` or `SYNC: REALTIME`).
* **Hover State:** Border transitions immediately to `var(--border-focus)`. A `6px` square indicator in the header bar switches color to `var(--accent-signal)`.

### C. Automation Pipeline Visualizer (Signature Component)
Instead of static icons for automation services, render interactive **Node Pipelines**:
* **Nodes:** Rectangular blocks (`border: 1px solid var(--border-grid)`, `background: var(--bg-elevated)`) representing real triggers and actions (e.g., `[Webhook: Order Created]` $\rightarrow$ `[Script: Data Transform]` $\rightarrow$ `[DB: Supabase Sync]`).
* **Connectors (Dual-Ribbon Path):** Connect nodes using two parallel `2px` SVG strokes separated by a `4px` gap—directly referencing the double-ribbon geometry of the **Devyx** infinity mark[cite: 1, 2].
* **Animation:** Animate a `stroke-dashoffset` pulse in `var(--accent-signal)` (`#00E0FF`) traveling continuously along the connector path to signify automated execution.

### D. Mechanical Theme Switcher (Navigation Bar)
* Replace generic sun/moon icons with a segmented monospace hardware toggle in the top navigation bar:
  `[ DARK // LIGHT ]`
* Active state is highlighted with a solid `var(--accent-primary)` indicator block and `var(--bg-primary)` text.