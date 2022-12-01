# myplaceonline_phonegap

* Latest Development Build: https://build.phonegap.com/apps/1133885/share
* Latest Android App in the Google Play Store: https://play.google.com/store/apps/details?id=com.myplaceonline

For details, see parent project at https://github.com/myplaceonline/myplaceonline

## Local build

* sudo npm install -g cordova

### Android

* Make sure .main is not in config.xml
* export ANDROID_HOME=~/Android/Sdk/
* export PATH=${ANDROID_HOME}/tools/:$PATH
* phonegap build android
* phonegap build android --release -- --keystore="../../lib/keys/myplaceonline_android_phonegap.keystore" --alias=myplaceonline_alias

### iOS

1. Add .main to config.xml
1. `cordova platform rm ios`
1. `cordova platform add ios`
1. `open -a Xcode platforms/ios`
    1. Wait for "Indexing" to complete
    1. First time: Preferences } Accounts } Add } root@myplaceonline.com
    1. Double click on FindHumane
        1. Signing & Capabilities } Team: Kevin Grigorenko

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
