# Design System Specification: Modern Apothecary

## 1. Overview & Creative North Star
**Creative North Star: The Digital Curator**
This design system rejects the frantic, "gamified" aesthetic of typical wellness apps in favor of a high-end, editorial experience. It is inspired by the precision of a modern apothecary: clean, professional, and deeply intentional. 

To move beyond "standard" UI, we utilize **The Curator’s Layout**—a philosophy that prioritizes generous negative space (using our 16 and 20 spacing tokens), intentional asymmetry, and a rejection of structural lines. By layering surfaces rather than boxing them in, we create an interface that feels like a physical collection of fine stationery and glass vessels rather than a digital grid.

---

## 2. Colors & Tonal Depth
Our palette moves away from "infant" pastels toward a mature, grounded spectrum of Slate Blues (`primary`), Muted Teals (`secondary`), and Earthy Sages (`tertiary`).

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section content. 
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` component should sit atop a `surface` background. If you feel the need for a line, you haven't used your surface tokens effectively.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of heavy-weight paper.
- **Base Layer:** `surface` (#fbf9f6)
- **Secondary Tier:** `surface-container-low` (#f5f3f0) for subtle grouping.
- **Elevation Tier:** `surface-container-highest` (#e4e2df) for high-priority interactive cards.

### The "Glass & Gradient" Rule
To evoke the "Modern Apothecary" feel, use **Glassmorphism** for floating navigation or modal overlays. Use a 70% opacity version of `surface-container-lowest` with a `20px` backdrop blur. 
*Signature Polish:* Use a subtle linear gradient from `primary` (#324e58) to `primary-container` (#4a6670) for Hero CTAs to provide a "lit from within" depth that flat colors lack.

### Pill Categorization (The Apothecary Palette)
For supplement categorization, use these 10 conservative, earth-toned accents:
1. **Deep Navy** (Category: Focus)
2. **Olive Green** (Category: Vitality)
3. **Terracotta** (Category: Bone Health)
4. **Slate Blue** (Category: Sleep)
5. **Charcoal** (Category: Minerals)
6. **Sand** (Category: Skin)
7. **Ochre** (Category: Immunity)
8. **Forest Green** (Category: Digestion)
9. **Steel** (Category: Recovery)
10. **Rust** (Category: Heart)

---

## 3. Typography: Editorial Authority
The juxtaposition of a sophisticated serif and a technical sans-serif creates a "Prescription-meets-Vogue" aesthetic.

- **Display & Headlines (Newsreader):** Use `display-lg` (3.5rem) with tighter tracking (-0.02em) for a high-fashion editorial feel. This font carries the "Apothecary" weight—it feels historical yet precise.
- **Body & Technical Info (Manrope):** Use `body-md` (0.875rem) for all functional text. Manrope’s geometric clarity ensures that dosage information and ingredients are legible even at small scales.
- **Hierarchy Tip:** Always pair a `headline-sm` serif with a `label-md` Manrope subheader in all-caps (letter-spacing: 0.1rem) to establish clear, professional information architecture.

---

## 4. Elevation & Depth
We convey hierarchy through **Tonal Layering** rather than shadows or structural strokes.

- **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card (Pure White) onto a `surface-container-low` background. This creates a soft, natural lift.
- **Ambient Shadows:** Shadows are a last resort. If required, use a blur of `32px`, spread of `0`, and a `4%` opacity of the `on-surface` color. It should feel like a soft glow, not a drop shadow.
- **The Ghost Border Fallback:** If accessibility requires a border, use the `outline-variant` token (#c2c7ca) at **15% opacity**. High-contrast borders are strictly forbidden.

---

## 5. Components

### Buttons
- **Primary:** Background: `primary` (#324e58) | Text: `on-primary`. Shape: `xl` (3rem/48px) for a pill-shaped, soft-touch feel.
- **Secondary:** Background: `surface-container-high` | Text: `primary`. No border.
- **States:** Hover states should involve a subtle shift to `primary-container`, never a brightness flash.

### Cards & Lists
- **The Forbiddance of Dividers:** Never use horizontal rules. Separate list items using `spacing-3` (1rem) of vertical white space or by alternating background tones between `surface` and `surface-container-low`.
- **Corner Radius:** All container components must utilize `xl` (3rem/48px) or `lg` (2rem/32px) roundness to maintain the "non-anxious" user experience.

### Inputs & Selection
- **Text Fields:** Use `surface-container-lowest` as the fill. The label should be `label-md` in Manrope. Upon focus, the background shifts to `surface-bright`.
- **Pill Chips:** Use the **Apothecary Palette** colors at 10% opacity for the background and 100% opacity for the text. Roundness: `full`.

### Signature Component: The "Dose-Tray"
A custom component for this app. A horizontal, scrolling tray using `surface-container-highest` with high-roundness `lg` corners, designed to look like a physical apothecary tray holding different supplement "vials."

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetric margins. A layout that is slightly "off-center" feels curated and bespoke.
- **Do** lean into the "Warm Stone" (`surface`) background. It reduces eye strain compared to pure white.
- **Do** use `Newsreader` for any text meant to be "heard" in a calm, authoritative voice.

### Don't
- **Don’t** use 1px lines or dividers. They create visual noise and "grid-anxiety."
- **Don’t** use "Alert" red for everything. For non-critical errors, use `tertiary` (Earthy Sage) to gently nudge the user. 
- **Don’t** use standard Material Design elevations. We are building a luxury apothecary, not a generic utility app.