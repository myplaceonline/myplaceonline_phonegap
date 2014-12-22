app = {
  isDeviceReady: false,

  base_url: "https://myplaceonline.com",

  firstLoad: true,

  phonegapPath: "",
  
  phonegapHomepage: "",

  // The basic flow is: JQM mobileinit calls this function. This function registers
  // a JQM pageloaded handler for the main built-in page. Once the built-in page loads,
  // we bind phonegap events. Once that finishes, we load the real homepage.
  // This is called after the myplaceonline.js load and mobileinit because that was bound first.
  mobileinit: function() {
    // We always set debug to true to capture the initial set of console logs in case there's a problem,
    // but in most cases when the homepage comes in, it will disable debug
    myp.debug = true;
    consoleLog("phonegap mobileinit");
    app.savePhonegapPath();
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    $.mobile.defaultPageTransition = "none";
    myp.allowFocusPlaceholder = false;
    myp.inPhoneGap = true;
    $(document).on("pagecontainerchangefailed.phonegap", app.loadFailed);
    pageloaded("phonegapmain", app.initialpageloaded);
  },

  savePhonegapPath: function() {
    app.phonegapHomepage = window.location;
    var path = window.location.pathname;
    app.phonegapPath = path.substring(0, path.lastIndexOf('/') + 1);
  },

  initialpageloaded: function() {
    consoleLog("phonegap initialpageloaded");
    app.bindEvents();
  },

  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener("deviceready", app.onDeviceReady, false);
    document.addEventListener("backbutton", app.onBackButton, false);
    document.addEventListener("menubutton", app.onMenuButton, false);
  },

  onDeviceReady: function() {
    consoleLog("phonegap onDeviceReady");
    if (window.StatusBar) {
      StatusBar.overlaysWebView(false);
      //StatusBar.backgroundColorByHexString("#321e15");
      //StatusBar.styleLightContent();
    }
    $(document).on('click', 'a.externallink', function(ev) {
      try {
        var href = $(this).attr('href');
        if (href) {
          var options = "location=yes,toolbar=yes";
          if ($(this).hasClass("noloc")) {
            // Even though it doesn't look nice, we keep the location bar because otherwise if the user
            // clicks a link to some external page, there won't be a back button.
            // options = "location=no,toolbar=no";
          }
          if (href.charAt(0) == '/') {
            href = app.base_url + href;
          }
          var popup = window.open(href, '_blank', options);
          popup.addEventListener("loaderror", function(e) {
            criticalError("Load error. " + e.message);
          });
          popup.addEventListener("loadstart", function(e) {
            if (e.url.indexOf("phonegapcapture=true") != -1) {
              var src = e.url.replace("#_=_", "");
              var q = src.indexOf('?');
              var uri = src.substring(0, q).replace(app.base_url, "");
              var params = src.substring(q + 1).replace("&noop=true", "").replace("&phonegapcapture=true", "").replace("phonegapcapture=true", "");
              if (params.length > 0) {
                uri = uri + "?" + params;
              }
              popup.close();
              app.navigate(uri);
            }
            consoleLog("Popup about to navigate to " + e.url);
          });
          return false;
        }
      } catch (clickE) {
        criticalError("External Link Error. " + clickE);
      }
      return true;
    });
    app.isDeviceReady = true;
    // Hack: If we call splashcreen.hide immediately, there's a blank flash in between
    setTimeout(function() {
      navigator.splashscreen.hide();
      app.loadHomepage();
    }, 1000);
  },

  loadHomepage: function() {
    consoleLog("phonegap loadHomepage");
    $("base").attr("href", app.base_url + "/");
    $.mobile.path.documentBase = $.mobile.path.parseUrl(app.base_url + "/");
    app.navigate("/?phonegap=true");
  },

  navigate: function(url) {
    consoleLog("phonegap navigate " + url);
    $.mobile.pageContainer.pagecontainer("change", url, {
      allowSamePageTransition: true,
      transition: 'none',
      reloadPage: true,
      changeHash: true
    });
  },

  onBackButton: function() {
    consoleLog("phonegap onBackButton");

    if (!myp.isInitialPhonegapPage || window.location.hash.indexOf("ui-state=dialog") != -1) {
      window.history.go(-1);
    } else {
      app.close();
    }
  },

  onMenuButton: function() {
    consoleLog("phonegap onMenuButton");
    var hmPopupSel = "#headerMenuPopup";
    var optPopupSel = "#menuPopup";
    var p = getActivePage();
    if (p) {
      var uid = $(p).attr('data-uniqueid');
      if (uid) {
        // Close the popup if open and open it if closed
        if($(hmPopupSel).attr("aria-expanded") === "true"){
          $(optPopupSel + uid).popup("close");
        }
        else{
          $(optPopupSel + uid).popup("open", {"positionTo": hmPopupSel});
        }
      }
    }
  },

  loadFailed: function(event, ui) {
    consoleLog("phonegap loadFailed");
    event.preventDefault();
    var activePage = getActivePage();
    if (activePage) {
      if (activePage.id == "phonegapmain") {
        $("#pgextra").html("<p>Cannot connect to the server.</p><p><a class='ui-btn' id='refresh_button'>Retry</a></p>");
        $("#refresh_button").click(function() {
          $.mobile.pageContainer.pagecontainer("change", ui.toPage);
        });
        $("#refresh_button").button();
      } else {
        // This could have just been a network blip and JQM will show an error popup and then the user can
        // try again
        //activePage.empty();
        //activePage.html("<p>Cannot connect to the server.</p><p><a class='ui-btn' id='refresh_button'>Retry</a></p>");
      }
    } else {
      alert("Cannot connect to the server. Please reload the application.");
    }
    hideLoading();
  },

  isAndroid: function() {
    return device.platform == 'android' || device.platform == 'Android';
  },

  isiOS: function() {
    return device.platform == 'iOS';
  },

  checkFirstLoad: function() {
    /*
    if (app.firstLoad) {
      app.firstLoad = false;

      setTimeout(function() {
        var activePage = getActivePage();
        if (activePage) {
          if (activePage.id == "phonegapmain") {
            alert("We're very sorry, but you hit a known issue that we haven't figured out yet. Please click Send Details to help us figure it out, then terminate the app and restart. Sorry.");
            var extra = document.getElementById("pgextra");
            if (extra) {
              var button = document.createElement("button");
              button.innerHTML = "Send Details";
              button.onclick = function() {
                sendDebug();
                window.setTimeout(function() {
                  alert("Thank you for providing details. Please re-open the app and try again.");
                  app.close();
                }, 10000);
              };
              extra.appendChild(button);
            }
          }
        }
      }, 5000);
    }
    */
  },

  // Attempt to close the application on non-iOS devices. This will probaby just send the app
  // to the background rather than terminating it.
  //
  // "Never quit an iOS app programmatically."
  // https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/MobileHIG/MobileHIG.pdf
  close: function() {
    consoleLog("app close called!");

    if (!app.isiOS()) {
      if (navigator.app) {
        navigator.app.exitApp();
      } else if (navigator.device) {
        navigator.device.exitApp();
      }
    }
  }
};
