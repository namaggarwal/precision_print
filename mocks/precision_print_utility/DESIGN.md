---
name: Precision Print Utility
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  dimension-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  canvas-padding: 48px
---

## Brand & Style

The design system is engineered for a high-utility photo printing environment where precision and clarity are paramount. The brand personality is professional, dependable, and technical, yet stays out of the way to ensure the user’s photography remains the hero of the experience. 

We employ a **Modern Corporate** style with a focus on **Tool-Centric Minimalism**. This means heavy use of whitespace to reduce cognitive load, combined with a "Canvas" metaphor that clearly separates the application's controls from the creative workspace. The UI should feel like a high-end drafting tool: precise, responsive, and trustworthy.

## Colors

The palette is anchored by **Print Blue**, a high-visibility primary color used for all call-to-actions and active states. **Success Green** is reserved strictly for completion states, upload confirmations, and "Ready to Print" statuses. 

We use a sophisticated range of neutral grays to establish UI hierarchy. The **Canvas Background** is a specific light-gray shade designed to provide enough contrast against white photo paper mockups without being distracting. The **Cut Boundary** color is a high-contrast red, used specifically for dashed lines indicating bleed and trim areas to ensure user error is minimized.

## Typography

This design system utilizes **Inter** for its exceptional legibility in technical interfaces and its neutral, modern character. 

Hierarchy is established through weight and color rather than excessive size shifts. A specialized `dimension-mono` style is used for printing specs (e.g., "8 x 10 in") to ensure numerical data is easily scannable. For mobile, `headline-lg` should scale down to 24px to maintain viewport efficiency while the user interacts with the canvas.

## Layout & Spacing

The layout follows a strict **8px grid system** to maintain vertical rhythm and alignment across technical property panels. 

We use a **Fluid-Fixed Hybrid** model: the main "Canvas" area is fluid, expanding to fill the viewport, while the property sidebars (configuration tools) are fixed at 320px or 360px. This ensures that printing controls remain consistent in location while the photo preview maximizes its available space. Large `canvas-padding` ensures that photo edges never feel cramped against the UI chrome.

## Elevation & Depth

Depth is used sparingly to maintain the "utility tool" aesthetic. We utilize **Tonal Layers** for the primary UI structure:
- **Level 0 (Background):** The application frame and sidebars.
- **Level 1 (Canvas):** A recessed surface using a subtle inner shadow to indicate a workspace.
- **Level 2 (Photo Product):** The actual photo paper, which uses a crisp, medium-diffusion ambient shadow to lift it off the canvas.

Shadows are neutral (Slate-900) with low opacity (between 4% and 10%) to avoid a muddy appearance. Borders are preferred over shadows for input fields and containers to maintain a sharp, technical feel.

## Shapes

The shape language is consistently **Soft-Geometric**. A standard radius of **8px (0.5rem)** is applied to all primary UI components including buttons, input fields, and panels. 

Small components like tooltips or tags use a 4px radius. The "Canvas" items (the photos themselves) maintain their physical aspect ratios and sharp corners unless the user selects a specific "rounded corner" print product, in which case the UI must accurately reflect the physical product's radius.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Print Blue with white text. High contrast, 8px radius.
- **Secondary Action:** Ghost style with Print Blue border and text.
- **Input Fields:** 1px solid Gray-300 border, turning Print Blue on focus. Use "Label-SM" for persistent floating titles to help with dimension entry.

### Canvas & Workspace
- **The Photo Paper:** A white surface with a 1px stroke (Gray-200) and a subtle drop shadow.
- **Cut Boundary:** A 1.5pt dashed line in `cut_boundary_hex` (Red). This must always sit on top of the user's image with a 0.5px white outer glow to ensure visibility against dark photos.
- **Safe Zone:** A secondary dashed line in a light gray to indicate the recommended "safe for text" area.

### Special UI Elements
- **Dimensions Chip:** A small, semi-transparent dark pill that overlays the corner of a photo to show current height/width.
- **Progress Stepper:** A horizontal bar at the top of the UI using Success Green to indicate completed configuration steps (Upload > Edit > Finish).