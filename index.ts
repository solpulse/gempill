import { registerRootComponent } from 'expo';
import notifee, { EventType } from '@notifee/react-native';

import App from './App';

// Register background handler (Critical for Notifee actions to work when app is closed)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;
    console.log(`[onBackgroundEvent] Notification handled: ${notification?.id} Action: ${pressAction?.id}`);

    // Check if the user pressed the "Take" action
    // Since we set launchActivity: 'default', the app will open anyway.
    // We can just return here. The App.tsx logic will handle the UI.
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
