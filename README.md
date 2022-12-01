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
1. `cordova build ios`
1. `open -a Xcode platforms/ios`
    1. Wait for "Indexing" to complete
    1. First time: Preferences } Accounts } Add } root@myplaceonline.com
    1. Double click on FindHumane
        1. Signing & Capabilities } Debug } Team: ...
        1. Signing & Capabilities } Release } Team: ...
        1. Signing & Capabilities } Debug } Uncheck "Automatically manage signing"
        1. Signing & Capabilities } Debug } Check "Automatically manage signing"
        1. Enable Automatic
        1. Signing & Capabilities } Debug } Team: ...
        1. Build Settings } Code Signing Identity } Release } Apple Development
    1. Next to the play/stop buttons, to the right of myplaceonline, select Build } Any iOS Device
    1. Product } Archive
    1. Click Distribute App
    1. Wait for an email that "The following build has completed processing"
    1. Go to https://appstoreconnect.apple.com/apps/
        1. Click on Myplaceonline
        1. Click on the plus button in the top left to create a new version and put in X.Y.Z
        1. Summarize updates under "What's New in This Version"
        1. If needed, update screenshots and other metadata.
            1. iPhone 14 Pro Max for 6.7" Screenshots. 1290x2796
            1. iPhone 12 Pro Max for 6.5" Screenshots
            1. iPhone 8 Plus for 5.5" Screenshots 1242x2208
            1. iPad Pro (4th Gen) for iPad Pro (3rd Gen) 12.9" Screenshots 2048x2732
            1. iPad Pro (4th Gen) for iPad Pro (2nd Gen) 12.9" Screenshots
        1. Click the button, "Select a build before you submit your app"
            1. Select Yes for encryption and Yes for exemption.
        1. Click Save
        1. Wait for the notification that the app is ready to be tested in Test Flight
        1. Test the app using Test Flight

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
