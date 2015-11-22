app = {
  isDeviceReady: false,

  base_url: "https://myplaceonline.com",

  firstLoad: true,

  phonegapPath: "",
  
  phonegapHomepage: "",
  
  offline: false,

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
    app.phonegapHomepage = "" + window.location;
    var path = "" + window.location.pathname;
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
    
    // If the user click's on an http:// or https:// link, and that link
    // is not to myplaceonline, then open it in the phone's default external
    // browser
    $(document).on('click', 'a', function(ev) {
      try {
        var href = $(this).attr('href');
        if (href) {
          if ((href.indexOf("http:") == 0 || href.indexOf("https:") == 0) && href.indexOf(app.base_url) != 0) {
            createSuccessNotification("Launching phone browser...");
            window.open(href, '_system');
            return false;
          }
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
      if (!app.offline) {
        app.loadHomepage();
      } else {
      }
    }, 300);
  },

  loadHomepage: function() {
    consoleLog("phonegap loadHomepage " + app.base_url + "/");
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
    consoleLog("phonegap loadFailed " + event + "," + ui);
    consoleDir(event);
    consoleDir(ui);
    event.preventDefault();
    var activePage = getActivePage();
    if (activePage) {
      if (activePage.id == "phonegapmain") {
        $("#pgextra").html("<p>Cannot connect to the server.</p><p><a class='ui-btn' id='refresh_button'>Retry</a></p><a class='ui-btn' id='diagnostics_button'>Show Diagnostics</a></p>");
        $("#refresh_button").click(function() {
          $.mobile.pageContainer.pagecontainer("change", ui.toPage);
        });
        $("#diagnostics_button").click(function() {
          showDebugConsole();
        });
        var offlineData = getMyplaceonlineSnapshot();
        if (offlineData) {
          $("#pgextra").append("<p>There is also an offline snapshot created at " + offlineData.time + "</p><p><a class='ui-btn' id='offline_button'>Load Offline Snapshot</a></p>");
          $("#offline_button").click(function(e) {
            var offlineData = getMyplaceonlineSnapshot();
            if (offlineData) {
              navigate(app.phonegapHomepage.replace("index.html", "offline.html"), true);
            }
            e.preventDefault();
            return false;
          });
        }
        ensureStyledPage();
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
