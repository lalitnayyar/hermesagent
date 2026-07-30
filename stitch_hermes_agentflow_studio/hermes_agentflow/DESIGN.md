---
name: Hermes AgentFlow
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  tech-mono:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin: 24px
---

## Brand & Style
The design system is engineered for a "Technical Excellence" aesthetic, bridging the gap between high-scale engineering and executive business intelligence. The brand personality is authoritative, precise, and sophisticated, designed to instill confidence in users orchestrating complex AI workflows.

The design style is **Corporate Modern with Technical Accents**. It utilizes deep, stable backgrounds to provide a canvas for high-density information. The interface prioritizes clarity and functional density, using subtle glowing effects and micro-interactions to signal AI activity and system health without overwhelming the user. The goal is to make the "Studio" feel like a high-end control center where complexity is managed through rigorous visual hierarchy.

## Colors
This design system utilizes a "Deep Tech" dark-mode first palette. The foundation is built on **Deep Slate (#0F172A)** and an even darker background for maximum contrast.

- **Primary (Corporate Blue):** Used for primary actions, active navigation states, and focus indicators.
- **Success (Green):** Specifically for "Active" agent statuses and successful flow completions.
- **Warning (Amber):** Used for "Pending" states, rate-limiting warnings, or configuration alerts.
- **Neutral Grays:** Used for secondary text, borders, and structural divisions.
- **AI Status Accents:** Use highly saturated, low-opacity glows (8-12% opacity) behind active nodes to indicate background processing.

## Typography
The typography strategy employs **Inter** for all UI and instructional text to ensure maximum readability in high-density layouts. For technical data—such as Agent IDs, API endpoints, and session logs—**Geist** (or an equivalent technical mono) is used to distinguish raw data from interface controls.

Hierarchies are maintained through weight rather than size alone to keep the layout compact. Large display sizes are reserved for dashboard overviews, while the "Studio" workspace relies on `body-sm` and `tech-mono` to maximize visible workspace.

## Layout & Spacing
The system utilizes a **4px baseline grid** to achieve a high-density, "professional tool" feel. 

- **Studio Workspace:** Uses a "No Grid" philosophy for the canvas, relying on an 8px snap-to-grid for workflow nodes. 
- **Data Views:** Uses a fluid grid for tables, ensuring data spans the full width of the viewport.
- **Breakpoints:** 
  - Mobile (0-768px): Single column, simplified "Status Only" view.
  - Tablet (769-1200px): Fixed sidebar, fluid content.
  - Desktop (1201px+): 12-column grid for dashboards; 3nd-column (left) and 4th-column (right) panels in the Studio view.

## Elevation & Depth
In this dark, technical environment, depth is established through **Tonal Layers** rather than heavy shadows.

- **Level 0 (Background):** Deepest black/slate, used for the main application background.
- **Level 1 (Surface):** Deep Slate (#0F172A), used for the primary workspace panels and sidebars.
- **Level 2 (Elevated):** Lighter slate with a subtle `1px` border (#1E293B). Used for cards and modals.
- **Accents:** Use a "Digital Glow" for active states. This is a 4px blur of the primary or success color at 20% opacity, applied to the border or as a drop shadow to indicate "Live" status.

## Shapes
The shape language is **Soft (0.25rem)**. This keeps the aesthetic feeling "sharp" and professional without being unnecessarily aggressive or overly consumer-friendly. 

- **Small elements (Buttons, Inputs, Badges):** 4px radius.
- **Container elements (Cards, Nodes):** 8px radius.
- **Status Indicators:** Perfect circles for connection "pings."

## Components

### Connection Status Badges
Small, pill-shaped badges with a 2px "ping" dot. The dot should have a CSS pulse animation when "Syncing" or "Active." Text is rendered in `label-xs`.

### Agent Cards
Cards use a 1px border (#1E293B). The header includes the Agent name in `headline-sm` and the ID in `tech-mono`. A vertical status bar on the far-left edge of the card changes color based on the agent's current state (Primary for Idle, Success for Running, Tertiary for Paused).

### Workflow Nodes
Nodes on the canvas are Level 2 surfaces. Input/Output ports are rendered as small squares on the edges. Active data paths (edges) should be rendered in Primary Blue with a directional moving dash animation during execution.

### Data Tables
High-density styling with `0px` cell padding on the horizontal axis and `8px` on the vertical. Header rows are `label-xs` with a subtle Slate-800 background. Use alternating row stripes (Zebra striping) at very low contrast for readability.

### Inputs & Buttons
- **Inputs:** Darker than the surface, 1px border. Focus state uses a `0 0 0 2px` glow of the Primary color.
- **Buttons:** Primary buttons are solid Blue. Secondary buttons are "Ghost" style with a Slate border. All button text is `body-sm` weight 600.