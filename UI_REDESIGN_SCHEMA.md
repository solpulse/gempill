# UI Redesign Workflow Schema (Modern Apothecary)

## Core Directives
1. **Source of Truth**: The local `./.agents/skills/MD3ui/DESIGN.md` file is the ABSOLUTE and ONLY source of truth for design tokens, colors, and spacing.
2. **Logic Preservation**: Redesign actions must ONLY modify styling and UI components. Functional logic (State, Hooks, Event Handlers, API calls) must be preserved exactly as-is. 
    - *Rule:* If a component has a `handlePress` function, the `JSX` changes but the function reference must stay identical.
3. **Component Loyalty**: Transition all "generic" or "legacy" components (Alerts, Modals, Views) to `react-native-paper` equivalents to maintain strict MD3 consistency across Android system elements.

| Phase | Step | Action | Logic & Design Constraints |
| :--- | :--- | :--- | :--- |
| **1. Foundation** | Theme Update | Sync `src/theme/index.ts` | Set Primary: `#324e58`, Surface: `#fbf9f6`. Remove legacy hex values. |
| | Typo Setup | Configure Fonts | Serif (Newsreader) for Headlines; Sans-Serif (Manrope) for Body. |
| **2. Inventory** | Legacy Audit | Map legacy components | Identify `StyleSheet.create` blocks for replacement. |
| | Overlay Audit | Find Native Pop-ups | Identify `Alert.alert` or native `Modal` for `Dialog/Portal` conversion. |
| **3. Iteration** | Logic Barrier | Isolate UI from Logic | Verify that state transitions and hook dependencies remain intact. |
| | Redesign Loop | MD3 Transformation | Convert `View` → `Surface`, `TouchableOpacity` → `Button`. |
| | Overlay Refactor | Modernize Pop-ups | Replace native Android/iOS pop-ups with themed `Paper.Dialog`. |
| | Theming | `useTheme` Context | Bind all styling properties to theme variables. |
| **4. Audit** | Visual Check | "No-Line" Rule | 0px borders everywhere. Define boundaries via background color shifts. |
| | Rounding | Corner Validation | Strict usage of `xl` (48px) and `lg` (32px) corner radii. |
| | Polish | Final Depth | Apply signature 20px backdrop blur to all glass-morphic surfaces. |

## Execution Command
To begin refactoring a specific component, use the following prompt pattern:
`"Redesign [ComponentPath] following the UI Redesign Schema. Preserve all existing logic but transform the UI to Modern Apothecary MD3."`
