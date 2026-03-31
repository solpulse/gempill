package com.anonymous.Gempill

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * A BroadcastReceiver that handles notification action button presses.
 *
 * This uses PendingIntent.getBroadcast() instead of PendingIntent.getActivities(),
 * which means Android will NOT collapse the notification drawer when an action
 * button is pressed. This is the standard Android pattern used by Gmail, Loop Habits, etc.
 */
class NotificationActionReceiver : BroadcastReceiver() {

    companion object {
        const val TAG = "NotificationActionReceiver"
        const val ACTION_NOTIFICATION_ACTION = "com.anonymous.Gempill.NOTIFICATION_ACTION"
        const val EXTRA_ACTION_ID = "action_id"
        const val EXTRA_NOTIFICATION_ID = "notification_id"
        const val EXTRA_DOSE_ID = "dose_id"
        const val EXTRA_MEDICATION_ID = "medication_id"
        const val EXTRA_SCHEDULED_TIME = "scheduled_time"
        const val EXTRA_MED_NAME = "med_name"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_NOTIFICATION_ACTION) return

        val actionId = intent.getStringExtra(EXTRA_ACTION_ID) ?: return
        val notificationId = intent.getStringExtra(EXTRA_NOTIFICATION_ID) ?: return
        val doseId = intent.getStringExtra(EXTRA_DOSE_ID) ?: ""
        val medicationId = intent.getStringExtra(EXTRA_MEDICATION_ID) ?: ""
        val scheduledTime = intent.getStringExtra(EXTRA_SCHEDULED_TIME) ?: ""
        val medName = intent.getStringExtra(EXTRA_MED_NAME) ?: ""

        Log.d(TAG, "Action received: $actionId for notification: $notificationId, dose: $doseId")

        // Cancel the notification silently (drawer stays open because we're a BroadcastReceiver)
        val notificationManager = NotificationManagerCompat.from(context)
        notificationManager.cancel(notificationId.hashCode())

        // Also cancel via the string tag that Notifee uses
        notificationManager.cancel(null, notificationId.hashCode())

        // Emit event to JS layer so it can update the database
        try {
            val reactContext = (context.applicationContext as? MainApplication)
                ?.reactNativeHost
                ?.reactInstanceManager
                ?.currentReactContext

            if (reactContext != null) {
                val params: WritableMap = Arguments.createMap()
                params.putString("actionId", actionId)
                params.putString("notificationId", notificationId)
                params.putString("doseId", doseId)
                params.putString("medicationId", medicationId)
                params.putString("scheduledTime", scheduledTime)
                params.putString("medName", medName)

                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onNotificationAction", params)

                Log.d(TAG, "Emitted onNotificationAction event to JS")
            } else {
                Log.w(TAG, "React context not available, storing action for later processing")
                // Store the action in SharedPreferences for processing when the app opens
                val prefs = context.getSharedPreferences("gempill_pending_actions", Context.MODE_PRIVATE)
                prefs.edit()
                    .putString("pending_action_id", actionId)
                    .putString("pending_dose_id", doseId)
                    .putString("pending_notification_id", notificationId)
                    .putLong("pending_timestamp", System.currentTimeMillis())
                    .apply()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error emitting event to JS: ${e.message}", e)
        }
    }
}
