# Implementation Plan: Home Screen Redesign (Modern Apothecary)

This plan outlines the steps to refactor the Home screen and its sub-components to the "Modern Apothecary" design system, following the `md3ui` skill and `UI_REDESIGN_SCHEMA.md`.

## 1. Foundation: Theme & Typography Sync
- **Task 1.1**: Update `src/theme/index.ts` with tokens from `DESIGN.md`. 
    - `primary`: `#324e58`
    - `primaryContainer`: `#4a6670`
    - `surface`: `#fbf9f6` (The "Warm Stone" background)
    - `surfaceVariant`: `#e4e2df` (Map to `surface-container-highest`)
    - `background`: `#fbf9f6`
- **Task 1.2**: Update `src/theme/typography.ts`. 
    - Map `MD3` variants to use appropriate fonts. (Requires checking available fonts or creating a config).
    - Headlines/Display → Newsreader (Serif).
    - Body/Label → Manrope (Sans).

## 2. Infrastructure: Global Contexts
- **Task 2.1**: Validate `PaperProvider` usage in `App.tsx`.

## 3. Home Screen (`HomeScreen.tsx`) Refactor
- **Objective**: Create a high-end editorial feel with intentional negative space.
- **Header Section**:
    - Update `styles.greeting` to use `Newsreader` font and `displayLarge` variant.
    - Implement asymmetric layout (e.g., specific margins from `DESIGN.md`).
- **Adherence Card**:
    - Remove shadow/elevation.
    - Use `surface-container-low` (#f5f3f0) for background.
    - Set `borderRadius` to `lg` (32px).
    - Progress Bar: Add linear gradient color logic.
- **Schedule Section**:
    - Use Newsreader for "Today's Schedule" title.
    - Ensure `FlashList` has breathable spacing.

## 4. Component Refactor: `TimeGroupCard.tsx`
- **Objective**: Remove structural lines and "grid-anxiety."
- **Container**:
    - Remove `elevation: 2`.
    - Set `borderRadius` to `lg` (32px).
    - Use `surface-container-low` or `surface-container-highest` for depth.
- **Divider**: Remove 1px divider between `PillEntry` items. Replace with 16px vertical gap.

## 5. Component Refactor: `PillEntry.tsx`
- **Objective**: Minimalist "Stationery" aesthetic.
- **Icon**: Use Apothecary Palette accents at 10% opacity for the background.
- **Buttons**: Replace custom `TouchableOpacity` buttons with `react-native-paper` equivalents using `full` roundness.

## 6. Native Overlay Refactor
- **Task**: Audit `TimeGroupCard` (Modal) and replace with `Paper.Dialog` and `Portal` for full MD3 compliance.

## 7. Logic & Safety
- **Core Directive**: Do NOT touch the medication tracking logic or sync hooks.
