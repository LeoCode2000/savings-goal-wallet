package com.nativeimplementations

import android.app.AlertDialog
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

class NativeImplementationsModule(reactContext: ReactApplicationContext) :
  NativeNativeImplementationsSpec(reactContext) {

  override fun showConfirmDialog(
    title: String,
    message: String,
    confirmText: String,
    cancelText: String,
    promise: Promise
  ) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "Cannot show confirm dialog without an activity")
      return
    }

    activity.runOnUiThread {
      var settled = false
      fun settle(confirmed: Boolean) {
        if (!settled) {
          settled = true
          promise.resolve(confirmed)
        }
      }

      AlertDialog.Builder(activity)
        .setTitle(title)
        .setMessage(message)
        .setPositiveButton(confirmText) { _, _ -> settle(true) }
        .setNegativeButton(cancelText) { _, _ -> settle(false) }
        .setOnCancelListener { settle(false) }
        .setCancelable(true)
        .show()
    }
  }

  companion object {
    const val NAME = NativeNativeImplementationsSpec.NAME
  }
}
