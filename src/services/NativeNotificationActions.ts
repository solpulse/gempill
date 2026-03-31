/**
 * NativeNotificationActions
 *
 * TypeScript bridge to the native Android NotificationActionsModule.
 * This module creates notifications with BroadcastReceiver-based PendingIntents
 * for action buttons, so the notification drawer stays open when actions are pressed.
 *
 * Notifee on Android 12+ uses PendingIntent.getActivities() for ALL action buttons,
 * which forces the notification drawer to close. This is a known architectural issue
 * in Notifee's native layer (NotificationPendingIntent.java, line 91).
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { NotificationActionsModule } = NativeModules;

export interface NotificationActionEvent {
  actionId: string;
  notificationId: string;
  doseId: string;
  medicationId: string;
  scheduledTime: string;
  medName: string;
}

export interface NotificationAction {
  title: string;
  id: string;
}

export interface NotificationOptions {
  id: string;
  title: string;
  body: string;
  channelId: string;
  data: {
    doseId: string;
    medicationId: string;
    scheduledTime: string;
    medName: string;
  };
  actions: NotificationAction[];
}

class NativeNotificationActions {
  private emitter: NativeEventEmitter | null = null;

  private getEmitter(): NativeEventEmitter {
    if (!this.emitter) {
      this.emitter = new NativeEventEmitter(NotificationActionsModule);
    }
    return this.emitter;
  }

  /**
   * Display a notification with broadcast-based action buttons.
   * The notification drawer will NOT close when action buttons are pressed.
   */
  async displayNotification(options: NotificationOptions): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('[NativeNotificationActions] Only available on Android');
      return false;
    }

    return NotificationActionsModule.displayNotification(options);
  }

  /**
   * Replace an existing notification's action buttons with broadcast-based ones.
   * Call this after Notifee fires a trigger notification to fix the PendingIntent type.
   */
  async replaceNotificationActions(
    notificationId: string,
    options: Omit<NotificationOptions, 'id'>
  ): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    return NotificationActionsModule.replaceNotificationActions(notificationId, options);
  }

  /**
   * Listen for notification action events from the BroadcastReceiver.
   */
  onAction(callback: (event: NotificationActionEvent) => void): () => void {
    if (Platform.OS !== 'android') {
      return () => {};
    }

    const subscription = this.getEmitter().addListener('onNotificationAction', callback);
    return () => subscription.remove();
  }

  /**
   * Check for any pending actions that were stored when the app was not running.
   */
  async getPendingAction(): Promise<NotificationActionEvent | null> {
    if (Platform.OS !== 'android') {
      return null;
    }

    return NotificationActionsModule.getPendingAction();
  }
}

export default new NativeNotificationActions();
