# BOB IDE — Production-Grade CSS Architecture

## Overview

The BOB IDE styling system is built on pure CSS with a cypherpunk aesthetic, quantum neon effects, and glassmorphism. All CSS is performance-optimized for 60fps animations and responsive across mobile to 4K displays.

## File Structure

### Core Files
- **global.css** (9.5 KB) — Global theme variables, glassmorphism effects, form elements, accessibility
- **animations.css** (9.8 KB) — 14 keyframe animations, utility animation classes, smooth transitions
- **components.css** (18 KB) — Component-specific styling (titlebar, tabs, panels, chat, etc.)
- **responsive.css** (14 KB) — Mobile-first breakpoints: 480px, 768px, 1024px, 1440px, 1920px, 2560px+

### Supporting Files
- **tokens.css** — Design tokens (spacing, typography, shadows, glows)
- **themes.css** — Dark/light theme color system
- **reset.css** — CSS reset
- **typography.css** — Font definitions
- **layout.css** — Layout utilities

## CSS Import Order (main.tsx)

```
1. tokens.css       → Variables & tokens
2. themes.css       → Color system
3. reset.css        → Browser reset
4. typography.css   → Font stack
5. layout.css       → Layout utilities
6. global.css       → Global styles + glassmorphism
7. animations.css   → Keyframes + transitions
8. components.css   → Component styling
9. responsive.css   → Media queries
```

**Critical**: Import order matters. Each file builds on the previous.

## Color System (Cypherpunk Quantum)

### Primary Palette
```css
--quantum-cyan:    #00d4cc  /* Main accent */
--quantum-purple:  #c74dff  /* Secondary accent */
--quantum-green:   #00ff88  /* Success state */
--quantum-gold:    #ffd700  /* Warning/highlight */
--quantum-orange:  #ffa500  /* Energy/active */
--quantum-red:     #ff4466  /* Danger/error */
```

### Background Gradients
```css
--cypherpunk-bg:   #0a0e14  /* Base dark */
--bg-canvas:       #0a0e14  /* Main background */
--bg-workspace:    #0f1319  /* Secondary background */
```

### Text Colors
```css
--text-primary:    #e8f0ff  /* Main text */
--text-secondary:  #a8b5c8  /* Secondary text */
--text-tertiary:   #6f7a8f  /* Tertiary text */
--text-disabled:   #4a5268  /* Disabled state */
```

## Glassmorphism Effects

Three levels of blur/transparency:

```css
/* Thin glass (UI hints) */
.glass-thin {
  background: rgba(15, 19, 30, 0.2);
  backdrop-filter: blur(8px) saturate(160%);
  border: 1px solid rgba(0, 212, 204, 0.1);
}

/* Standard glass (panels) */
.glass {
  background: rgba(15, 19, 30, 0.4);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(0, 212, 204, 0.15);
}

/* Thick glass (important surfaces) */
.glass-thick {
  background: rgba(15, 19, 30, 0.65);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(0, 212, 204, 0.25);
}
```

**Browser Support**: 
- Chrome/Edge 76+ (native backdrop-filter)
- Firefox 103+ (native backdrop-filter)
- Safari 9+ (prefixed -webkit-backdrop-filter)

## Quantum Neon Glows

Four glow levels:

```css
/* Small glow (subtle) */
--glow-sm: 0 0 8px rgba(0, 212, 204, 0.3);

/* Medium glow (standard) */
--glow-md: 0 0 16px rgba(0, 212, 204, 0.4);

/* Large glow (emphasis) */
--glow-lg: 0 0 32px rgba(0, 212, 204, 0.5);

/* Full neon effect (intense) */
--glow-cyan: 0 0 20px rgba(0, 212, 204, 0.6), 0 0 40px rgba(0, 212, 204, 0.2);
--glow-purple: 0 0 20px rgba(199, 77, 255, 0.6), 0 0 40px rgba(199, 77, 255, 0.2);
--glow-green: 0 0 20px rgba(0, 255, 136, 0.6), 0 0 40px rgba(0, 255, 136, 0.2);
```

**Performance Note**: GPU accelerated via `box-shadow` (no performance penalty on 60fps). Text glows use `text-shadow` for proper text rendering.

## Animation System

### Keyframe Animations (14 total)

```css
pulse-glow          /* Pulsing box glow effect */
pulse-opacity       /* Opacity pulse (2s cycle) */
float-up            /* Float upward + fade (chat messages) */
slide-in-left       /* Slide from left (dialogue) */
slide-in-right      /* Slide from right */
slide-in-top        /* Slide from top */
slide-in-bottom     /* Slide from bottom */
fade-in             /* Simple fade in */
fade-out            /* Simple fade out */
scale-in            /* Scale from 0.95 to 1 */
quantum-flicker     /* CRT flicker effect */
crt-scanlines       /* Scanline movement */
rotate-360          /* Full rotation */
glow-shift          /* Color shift glow */
blink               /* On/off blink */
```

### Transition Timing

```css
--time-fast:    110ms   /* Snappy interactions */
--time-normal:  180ms   /* Standard transitions */
--time-slow:    280ms   /* Emphatic transitions */

--ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1)    /* Standard */
--ease-in-cubic:    cubic-bezier(0.32, 0, 0.67, 0)  /* Quick start */
--ease-out-cubic:   cubic-bezier(0.33, 0.66, 0.66, 1) /* Smooth end */
```

**60fps Performance**: All animations use:
- `transform` for GPU acceleration
- `opacity` for lightweight fading
- `box-shadow` for glows (cached by GPU)
- NO layout-triggering properties (width, height, left, top)

### Using Animations

```html
<!-- Utility classes for quick animation -->
<div class="animate-pulse-glow">Glowing effect</div>
<div class="animate-slide-in-left">Slides in from left</div>
<div class="animate-float-up">Floats up + fades</div>

<!-- Transitions -->
<button class="transition-fast">Quick transition</button>
<div class="transition-colors">Color transitions only</div>
<div class="hover-lift">Lifts on hover</div>
```

## Component Styling

### Titlebar (.v-bar)
- Height: 36px
- Gradient background + glass effect
- Sticky top position (flex-shrink: 0)
- Contains window dots, title, tabs, HUD

### Tabs (.v-tab)
- Active state: cyan border + glow
- Hover state: background + color shift
- No layout shift on state change

### Chat Input (.v-chat-input)
- Glass background with blur
- Focus state: cyan border + glow
- Smooth transitions on all interactions

### Send Button (.v-send-btn)
- Gradient background (cyan primary)
- Hover: scale up + enhanced glow
- Active: scale down (tactile feedback)
- GPU accelerated transforms

### Agent Roster (.v-agent-row)
- Pulse animation on dot
- Hover: slide right + background highlight
- Smooth color transitions

## Responsive Design (Mobile-First)

### Breakpoints

| Size | Range | Use Case |
|------|-------|----------|
| Mobile | 0-480px | Phones (portrait) |
| Small | 480-768px | Large phones (landscape) |
| Tablet | 769-1024px | iPad, small tablets |
| Desktop | 1025-1440px | Standard desktop |
| HD+ | 1441-1920px | High-res desktop |
| 4K | 1921-2560px | Ultra HD displays |
| Ultra-wide | 2560px+ | Curved displays |

### Key Responsive Changes

**Mobile (≤768px)**
- Hide right panel (.v-right)
- Hide HUD metrics (.v-hud)
- Reduce font sizes by 1-2px
- Stack chat input vertically
- Collapse titlebar

**Tablet (769-1024px)**
- Show right panel (narrow: 240px)
- Reduce spacing/padding
- Medium font sizes
- Optimize for touch targets (44px min)

**Desktop (1025-1440px)**
- Full layout (right panel: 280px)
- Standard spacing
- Normal font sizes

**HD+ (1441-1920px)**
- Increase all font sizes +1px
- Increase panel widths
- More generous spacing

**4K (1921+)**
- Significant size increases
- Enhanced glow effects
- Larger touch targets

### Touch Device Optimization

```css
@media (hover: none) and (pointer: coarse) {
  /* Increase touch targets to 44px min */
  button { min-height: 44px; min-width: 44px; }
  
  /* Disable hover effects on touch */
  .v-tab:hover { transform: none; }
  
  /* Remove tap highlight color conflicts */
  * { -webkit-tap-highlight-color: rgba(0, 212, 204, 0.2); }
}
```

## Accessibility (WCAG AA)

### Keyboard Navigation
- All interactive elements focusable
- Focus ring visible: 2px cyan outline + glow
- Tab order intuitive (tabindex preserved)

### Color Contrast
- Primary text: #e8f0ff on #0a0e14 → 15.8:1 (AAA)
- Secondary text: #a8b5c8 on #0a0e14 → 11.2:1 (AAA)
- Accent cyan on dark → 7.8:1 (AA)

### Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled for motion-sensitive users */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast Mode
```css
@media (prefers-contrast: more) {
  /* Increase border visibility */
  --border-subtle: rgba(0, 212, 204, 0.4);
  --border-strong: rgba(0, 212, 204, 0.6);
  
  /* Add visible focus outlines */
  input:focus, button:focus { outline: 2px solid var(--quantum-cyan); }
}
```

### Windows High Contrast
```css
@media (forced-colors: active) {
  /* Use system colors automatically */
  button, input, textarea, select { border: 1px solid ButtonBorder; }
}
```

### Screen Reader Friendly
- Semantic HTML (button, input, label, etc.)
- ARIA labels on custom components
- Proper heading hierarchy

## Performance Optimizations

### 60fps Target

1. **GPU Acceleration**
   - All animations use `transform` + `opacity`
   - No `width`, `height`, `left`, `top` changes in animations
   - `will-change: transform` on frequently animated elements

2. **Efficient Selectors**
   - No deep nesting (max 3 levels)
   - Avoid overly broad selectors
   - Use classes for styling (faster than tag selectors)

3. **Rendering**
   - CSS `contain` for layout optimization
   - `backface-visibility: hidden` for transform layers
   - `pointer-events: none` on non-interactive overlays

4. **Paint Reduction**
   - Separate `color`, `background-color` into `transition-colors`
   - Use `box-shadow` instead of `border` for glows (GPU cached)
   - Minimal repaints on hover/focus

### File Size

- **global.css**: 9.5 KB (compressed: ~3 KB)
- **animations.css**: 9.8 KB (compressed: ~3.5 KB)
- **components.css**: 18 KB (compressed: ~6 KB)
- **responsive.css**: 14 KB (compressed: ~4.5 KB)
- **Total**: ~51 KB (compressed: ~17 KB gzip)

**CSS delivery**:
- Inline critical CSS in `<head>` if <10 KB (optional optimization)
- Load all CSS before React hydration
- No FOUT (Flash of Unstyled Text)

## Adding New Components

### 1. Define Color Scheme
```css
/* In global.css or themes.css */
--my-component-bg: rgba(15, 19, 30, 0.4);
--my-component-border: rgba(0, 212, 204, 0.15);
--my-component-accent: var(--quantum-cyan);
```

### 2. Create Component CSS
```css
/* In components.css */
.my-component {
  background: var(--my-component-bg);
  border: 1px solid var(--my-component-border);
  border-radius: 4px;
  padding: var(--space-8);
  transition: all var(--time-fast) var(--ease-in-out);
}

.my-component:hover {
  background: rgba(0, 212, 204, 0.08);
  box-shadow: 0 0 12px rgba(0, 212, 204, 0.3);
}
```

### 3. Add Responsive Rules
```css
/* In responsive.css */
@media (max-width: 768px) {
  .my-component {
    padding: var(--space-6);
    font-size: 11px;
  }
}
```

### 4. Use Animation Utility
```css
.my-component.entering {
  animation: slide-in-left var(--time-normal) var(--ease-out-cubic);
}
```

## Debugging

### Enable Visual Diagnostics
```css
/* Temporary debug overlay */
body.debug * {
  border: 1px solid rgba(255, 0, 0, 0.3) !important;
}
```

### Check Animation Performance
```js
// In DevTools console
performance.mark('animation-start');
// Run animation
performance.mark('animation-end');
performance.measure('animation', 'animation-start', 'animation-end');
```

### Verify Color Contrast
```js
// Use WebAIM contrast checker
// https://webaim.org/resources/contrastchecker/
```

## Future Enhancements

1. **Dark mode toggle** — Already supported via `[data-theme="dark"]`
2. **Custom neon colors** — Add CSS custom property overrides
3. **Reduced motion presets** — Already WCAG compliant
4. **High DPI optimization** — Use `@media (-webkit-min-device-pixel-ratio: 2)`
5. **Print styles** — Add `@media print` rules

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Backdrop-filter native |
| Edge 90+ | ✅ Full | Backdrop-filter native |
| Firefox 103+ | ✅ Full | Backdrop-filter as of 103 |
| Safari 9+ | ✅ Full | Uses -webkit- prefix |
| Opera 76+ | ✅ Full | Chromium-based |
| IE 11 | ❌ None | No backdrop-filter support |

For IE11 fallback (if needed):
```css
.glass {
  background: rgba(15, 19, 30, 0.65); /* Fallback color */
  @supports (backdrop-filter: blur(8px)) {
    background: rgba(15, 19, 30, 0.4);
    backdrop-filter: blur(16px);
  }
}
```

## References

- **Color System**: Quantum neon cypherpunk aesthetic
- **Glassmorphism**: Apple Human Interface Guidelines
- **Animations**: Material Design motion specs
- **Responsive**: Mobile-first approach (Luke Wroblewski)
- **Accessibility**: WCAG 2.1 AA standard
- **Performance**: Web Vitals + Core Web Vitals

---

**Last Updated**: 2026-07-20  
**CSS Architecture**: Pure CSS, no component libraries or frameworks  
**Performance Target**: 60fps on all animations, <20KB gzip  
**Made with Bob**
