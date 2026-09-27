package com.cowbank.app.qr

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CowQrScannerModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var pendingPromise: Promise? = null

  private val activityEventListener: ActivityEventListener =
    object : BaseActivityEventListener() {
      override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != REQUEST_CODE) return

        val promise = pendingPromise
        pendingPromise = null

        if (promise == null) return

        if (resultCode == Activity.RESULT_OK) {
          val value = data?.getStringExtra(QrScannerActivity.EXTRA_QR_VALUE)
          if (value.isNullOrBlank()) {
            promise.reject("empty_qr", "QR Code vazio.")
          } else {
            promise.resolve(value)
          }
        } else {
          promise.reject("cancelled", "Leitura cancelada.")
        }
      }
    }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  override fun getName(): String = "CowQrScanner"

  @ReactMethod
  fun scan(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("no_activity", "Activity indisponível para abrir a câmera.")
      return
    }
    if (pendingPromise != null) {
      promise.reject("scanner_busy", "O leitor de QR Code já está aberto.")
      return
    }

    pendingPromise = promise
    val intent = Intent(activity, QrScannerActivity::class.java)
    activity.startActivityForResult(intent, REQUEST_CODE)
  }

  companion object {
    private const val REQUEST_CODE = 48021
  }
}
