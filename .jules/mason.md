## 2024-05-24 - [ListEmptyComponent in FlashList]
**Learning:** FlashList does not automatically render any content if its data array is empty. This leaves users confused when no medications are scheduled for the day.
**Action:** Always provide a `ListEmptyComponent` and `estimatedItemSize` to `<FlashList>` implementations to ensure users have visual feedback when their lists are empty and performance is maintained.
