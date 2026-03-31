package com.anonymous.Gempill

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * Native Module that displays notifications with action buttons using PendingIntent.getBroadcast().
 *
 * Notifee on Android 12+ uses PendingIntent.getActivities() for ALL action buttons,
 * which forces the notification drawer to close. This module provides an alternative
 * that uses PendingIntent.getBroadcast(), keeping the drawer open — matching the
 * behavior of Gmail, Loop Habits, and other well-behaved Android apps.
 */
class NotificationActionsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NotificationActionsModule"

    /**
     * Display a notification with broadcast-based action buttons.
     *
     * @param options ReadableMap containing:
     *   - id: String (notification ID)
     *   - title: String
     *   - body: String
     *   - channelId: String
     *   - data: ReadableMap with doseId, medicationId, scheduledTime, medName
     *   - actions: ReadableArray of {title, id}
     */
    @ReactMethod
    fun displayNotification(options: ReadableMap, promise: Promise) {
        try {
            val context = reactApplicationContext
            val notificationId = options.getString("id") ?: return promise.reject("ERROR", "Missing notification id")
            val title = options.getString("title") ?: "Medication Reminder"
            val body = options.getString("body") ?: ""
            val channelId = options.getString("channelId") ?: "critical-alerts"

            val data = if (options.hasKey("data")) options.getMap("data") else null
            val doseId = data?.getString("doseId") ?: ""
            val medicationId = data?.getString("medicationId") ?: ""
            val scheduledTime = data?.getString("scheduledTime") ?: ""
            val medName = data?.getString("medName") ?: ""

            val builder = NotificationCompat.Builder(context, channelId)
                .setContentTitle(title)
                .setContentText(body)
                .setSmallIcon(android.R.drawable.ic_dialog_info) // fallback icon
                .setAutoCancel(false) // Don't auto-cancel on body tap; we handle it
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

            // Try to use our app icon
            try {
                val iconResId = context.resources.getIdentifier("ic_launcher", "mipmap", context.packageName)
                if (iconResId != 0) {
                    builder.setSmallIcon(iconResId)
                }
            } catch (e: Exception) {
                // Use default icon
            }

            // Set the content intent (tapping the notification body opens the app)
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
                val contentPendingIntent = PendingIntent.getActivity(
                    context,
                    notificationId.hashCode(),
                    launchIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                builder.setContentIntent(contentPendingIntent)
            }

            // Add action buttons using PendingIntent.getBroadcast()
            val actions = if (options.hasKey("actions")) options.getArray("actions") else null
            if (actions != null) {
                for (i in 0 until actions.size()) {
                    val action = actions.getMap(i) ?: continue
                    val actionTitle = action.getString("title") ?: continue
                    val actionId = action.getString("id") ?: continue

                    val broadcastIntent = Intent(context, NotificationActionReceiver::class.java).apply {
                        this.action = NotificationActionReceiver.ACTION_NOTIFICATION_ACTION
                        putExtra(NotificationActionReceiver.EXTRA_ACTION_ID, actionId)
                        putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notificationId)
                        putExtra(NotificationActionReceiver.EXTRA_DOSE_ID, doseId)
                        putExtra(NotificationActionReceiver.EXTRA_MEDICATION_ID, medicationId)
                        putExtra(NotificationActionReceiver.EXTRA_SCHEDULED_TIME, scheduledTime)
                        putExtra(NotificationActionReceiver.EXTRA_MED_NAME, medName)
                        // Use unique data URI to prevent PendingIntent reuse
                        this.data = android.net.Uri.parse("gempill://action/$notificationId/$actionId")
                    }

                    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
                    } else {
                        PendingIntent.FLAG_UPDATE_CURRENT
                    }

                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        (notificationId + actionId).hashCode(),
                        broadcastIntent,
                        flags
                    )

                    builder.addAction(0, actionTitle, pendingIntent)
                }
            }

            // Show the notification
            val notificationManager = NotificationManagerCompat.from(context)
            notificationManager.notify(notificationId.hashCode(), builder.build())

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to display notification: ${e.message}", e)
        }
    }

    /**
     * Replace an existing Notifee notification with one that has broadcast-based action buttons.
     * This is called after Notifee fires a trigger notification to "fix" the action intents.
     */
    @ReactMethod
    fun replaceNotificationActions(notificationId: String, options: ReadableMap, promise: Promise) {
        try {
            val context = reactApplicationContext

            val title = options.getString("title") ?: "Medication Reminder"
            val body = options.getString("body") ?: ""
            val channelId = options.getString("channelId") ?: "critical-alerts"

            val data = if (options.hasKey("data")) options.getMap("data") else null
            val doseId = data?.getString("doseId") ?: ""
            val medicationId = data?.getString("medicationId") ?: ""
            val scheduledTime = data?.getString("scheduledTime") ?: ""
            val medName = data?.getString("medName") ?: ""

            val builder = NotificationCompat.Builder(context, channelId)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)

            // Use app icon
            try {
                val iconResId = context.resources.getIdentifier("ic_launcher", "mipmap", context.packageName)
                if (iconResId != 0) {
                    builder.setSmallIcon(iconResId)
                }
            } catch (e: Exception) {
                builder.setSmallIcon(android.R.drawable.ic_dialog_info)
            }

            // Content intent for body tap
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
                val contentPendingIntent = PendingIntent.getActivity(
                    context,
                    notificationId.hashCode(),
                    launchIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                builder.setContentIntent(contentPendingIntent)
            }

            // Add action buttons using PendingIntent.getBroadcast()
            val actions = if (options.hasKey("actions")) options.getArray("actions") else null
            if (actions != null) {
                for (i in 0 until actions.size()) {
                    val action = actions.getMap(i) ?: continue
                    val actionTitle = action.getString("title") ?: continue
                    val actionId = action.getString("id") ?: continue

                    val broadcastIntent = Intent(context, NotificationActionReceiver::class.java).apply {
                        this.action = NotificationActionReceiver.ACTION_NOTIFICATION_ACTION
                        putExtra(NotificationActionReceiver.EXTRA_ACTION_ID, actionId)
                        putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notificationId)
                        putExtra(NotificationActionReceiver.EXTRA_DOSE_ID, doseId)
                        putExtra(NotificationActionReceiver.EXTRA_MEDICATION_ID, medicationId)
                        putExtra(NotificationActionReceiver.EXTRA_SCHEDULED_TIME, scheduledTime)
                        putExtra(NotificationActionReceiver.EXTRA_MED_NAME, medName)
                        this.data = android.net.Uri.parse("gempill://action/$notificationId/$actionId")
                    }

                    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
                    } else {
                        PendingIntent.FLAG_UPDATE_CURRENT
                    }

                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        (notificationId + actionId).hashCode(),
                        broadcastIntent,
                        flags
                    )

                    builder.addAction(0, actionTitle, pendingIntent)
                }
            }

            // Re-notify with same ID to replace the existing notification
            val notificationManager = NotificationManagerCompat.from(context)
            notificationManager.notify(notificationId.hashCode(), builder.build())

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to replace notification: ${e.message}", e)
        }
    }

    /**
     * Check for any pending actions stored when the app was not running.
     */
    @ReactMethod
    fun getPendingAction(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("gempill_pending_actions", Context.MODE_PRIVATE)
            val actionId = prefs.getString("pending_action_id", null)

            if (actionId != null) {
                val result: WritableMap = Arguments.createMap()
                result.putString("actionId", actionId)
                result.putString("doseId", prefs.getString("pending_dose_id", ""))
                result.putString("notificationId", prefs.getString("pending_notification_id", ""))
                result.putDouble("timestamp", prefs.getLong("pending_timestamp", 0).toDouble())

                // Clear the pending action
                prefs.edit().clear().apply()

                promise.resolve(result)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get pending action: ${e.message}", e)
        }
    }
}
