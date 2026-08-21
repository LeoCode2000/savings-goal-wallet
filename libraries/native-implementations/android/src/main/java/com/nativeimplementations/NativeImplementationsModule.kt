package com.nativeimplementations

import com.facebook.react.bridge.ReactApplicationContext

class NativeImplementationsModule(reactContext: ReactApplicationContext) :
  NativeNativeImplementationsSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeNativeImplementationsSpec.NAME
  }
}
