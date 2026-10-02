# App entry points (manifest-referenced; R8 usually keeps these automatically).
-keep class app.mytaskmanager.MainApplication { *; }
-keep class app.mytaskmanager.MainActivity { *; }

# React Native — JNI, modules, TurboModule / Fabric (New Architecture).
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keep @com.facebook.jni.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.jni.annotations.DoNotStrip *;
}
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**

# RevenueCat / Play Billing
-keep class com.revenuecat.purchases.** { *; }
-dontwarn com.revenuecat.purchases.**

# OkHttp / Okio (transitive)
-dontwarn okhttp3.**
-dontwarn okio.**
