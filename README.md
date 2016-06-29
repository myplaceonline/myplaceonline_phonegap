# myplaceonline_phonegap

* Latest Development Build: https://build.phonegap.com/apps/1133885/share
* Latest Android App in the Google Play Store: https://play.google.com/store/apps/details?id=com.myplaceonline

For details, see parent project at https://github.com/myplaceonline/myplaceonline

## Local build

* export ANDROID_HOME=~/Android/Sdk/
* export PATH=${ANDROID_HOME}/tools/:$PATH
* phonegap build android
* phonegap build android --release -- --keystore="../../lib/keys/myplaceonline_android_phonegap.keystore" --alias=myplaceonline_alias

## Remote Debugging

* Enable developer options: Settings > About phone and tap Build number seven times. Return to the previous screen to find Developer options at the bottom.
  * https://developer.android.com/studio/run/device.html
* Enable `USB debugging` and `Allow USB debugging in charging mode`
* Connect Phone and ensure USB debugging is enabled from the notifications
* sudo adb start-server
* export ANDROID_HOME=~/Android/Sdk/
* export PATH=${ANDROID_HOME}/tools/:$PATH
* adb shell uptime
* Accept the security warning on the device
* adb uninstall com.myplaceonline
* phonegap run android --device
* Open Chrome and go to chrome://inspect/#devices
