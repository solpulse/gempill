# Implementation Plan: Records & Add Medication Redesign

This plan covers the transition of the **Records Screen** and **Add Medication Flow** to the Modern Apothecary theme.

## 1. Records Screen (`RecordsScreen.tsx`)
- **Objective**: Transform the history and management view into a "Curated Archive."
- **Header**:
    - Use `displaySmall` Newsreader for "Records."
    - Replace the `Ionicons` profile button with a themed `IconButton` or a subtle `Avatar.Icon` with a tonal background.
- **System Overlay (CRITICAL)**:
    - Replace all `Alert.alert` calls in `handleProfilePress` with a themed `react-native-paper` `Dialog` and `Portal`.
    - Apply `lg` (32px) corner radius to the Dialog.
- **Calendar**:
    - Audit `CalendarView.tsx` to ensure it uses the Warm Stone palette and No-Line rule.
- **Pill Box (List)**:
    - Audit `MedicationListItem.tsx`. Use tonal layering instead of 1px borders.
    - Set list item corners to `lg` (32px).
- **FAB**:
    - Replace custom FAB with `Paper.FAB`.
    - Apply Slate Blue color and MD3 elevation/shaping.

## 2. Add Medication Screen (`AddMedicationScreen.tsx`)
- **Objective**: Simplify the form to feel like a "Personal Prescription" entry.
- **Layout**:
    - Remove `borderBottomWidth: 1` from the header.
    - Remove the fixed `footer` with its `borderTopWidth: 1`. Instead, use a floating action container or a long scroll that ends with an intentional footer.
- **Typography**:
    - Labels: Use `headlineSmall` (Newsreader) or `labelLarge` (Manrope) with refined tracking. Remove all-caps/bold styling where it feels "entry-level."
- **Components**:
    - **Inputs**: Replace `TextInput` with `Paper.TextInput` (flat mode usually suits Apothecary better than outlined if we want to avoid "boxes").
    - **Pickers**: Ensure `ColorSelector`, `IconSelector`, etc., use the `surface-container-highest` background and no borders.
- **Navigation**: Use "Cancel" and "Save" text buttons in the header if they feel more "editorial," or keep the pill buttons but styled with Apothecary colors.

## 3. Form Sub-Components
- **ColorSelector**: Update to use 10% opacity fills for selection states.
- **DosageInput**: Ensure the unit menu (Paper Menu) is styled with `xl` (48px) corners.

## 4. Logic & Safety
- **State**: Ensure `useMedicationForm` hook logic is strictly preserved.
- **Onboarding**: Preserve the `completeOnboarding` trigger logic.
