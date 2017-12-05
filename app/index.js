// import libraries
import clock from "clock";
import document from "document";
import {display} from "display";
import * as messaging from "messaging";
import * as fs from "fs";
import { me } from "appbit";
import {preferences} from "user-settings";
import { battery } from "power";
import { HeartRateSensor } from "heart-rate";
import dtlib from "../common/datetimelib"

let vortex = document.getElementById("vortex");
let notVortex = document.getElementById("notVortex");
let lbltime = document.getElementById("lbltime");
let lbldow = document.getElementById("lbldow");
let lblmonth = document.getElementById("lblmonth");
let lbldate = document.getElementById("lbldate");
let batteryBar = document.getElementById("batteryBar");
let batteryBack = document.getElementById("batteryBack");
let batteryEnd = document.getElementById("batteryEnd");
let heartIcon = document.getElementById("heartIcon");
let heartText = document.getElementById("heartText");
let secondHand = document.getElementById("second-hand");

// trying to get user settings if saved before
let userSettings;
try {
  userSettings = fs.readFileSync("user_settings.json", "json");
} catch (e) {
  userSettings = {showDigitalTime: true, 
                  showDow: true, 
                  showDate: true, 
                  showBattery: true,
                  showHeartRate: true,
                  showSeconds: true
                 }
}

//toggle functions
function showHideDigitalTime(toggle) {
  lbltime.style.display = toggle? "inline": "none";
}

function showHideDow(toggle) {
  lbldow.style.display = toggle? "inline": "none";
}

function showHideDate(toggle) {
  lbldate.style.display = toggle? "inline": "none";
}

function showHideBattery(toggle) {
  batteryBar.style.display = toggle? "inline": "none";
  batteryBack.style.display = toggle? "inline": "none";
  batteryEnd.style.display = toggle? "inline": "none";
}

function showHideHeartRate(toggle) {
  heartIcon.style.display = toggle? "inline": "none";
  heartText.style.display = toggle? "inline": "none";
}

function showHideSeconds(toggle) {
  secondHand.style.display = toggle? "inline": "none";
}


showHideDigitalTime(userSettings.showDigitalTime);
showHideDow(userSettings.showDow);
showHideDate(userSettings.showDate);
showHideBattery(userSettings.showBattery);
showHideHeartRate(userSettings.showHeartRate);
showHideSeconds(userSettings.showSeconds);

// on app exit collect settings 
me.onunload = () => {
  fs.writeFileSync("user_settings.json", userSettings, "json");
}


var hrm = new HeartRateSensor();
hrm.onreading = function() {
  if (display.on) {
    heartIcon.text="❤️";
    heartIcon.style.fontSize = (heartIcon.style.fontSize == 50? 45 : 50);
    heartText.text = hrm.heartRate;
  }
}
hrm.start();


function updateBattery(charge) {
  batteryBar.width = 51*charge/100;
  
  if (charge < 20) {
      batteryBar.style.fill =  batteryBack.style.fill = batteryEnd.style.fill = "#F83C40";
  } else if (charge < 50) {
      batteryBar.style.fill =  batteryBack.style.fill = batteryEnd.style.fill = "darkorange";  
  } else {
      batteryBar.style.fill =  batteryBack.style.fill = batteryEnd.style.fill =  "fb-lime";
  }
}

function animateVortex(delay, callback) {
  let frame = 1;
  let frameCount = 60;
  let i = setInterval(function(){
      vortex.href = `frames/frame_apngframe${dtlib.zeroPad(frame)}.png`;
      frame++;
      if (frame > frameCount) {
          clearInterval(i);
          if (callback) callback();
      }
  }, delay)
}

function updateClock() {
  
  // getting current date time
  let today = new Date();
  
  // formatting hours based on user preferences
  let hours = dtlib.format1224hour(today.getHours());
  
  // if this is 24H format - prepending 1-digit hours with 0
  if (dtlib.timeFormat == dtlib.TIMEFORMAT_24H) {
      hours = dtlib.zeroPad(hours);
  }
  
  // getting 0-preprended minutes
  let mins = dtlib.zeroPad(today.getMinutes());

  // assigning time to 3 textboxes for "neon" effect
  lbltime.text = `${hours}:${mins}`;
  
  // displaying shot day of the week in English
  lbldow.text = dtlib.getDowNameShort(dtlib.LANGUAGES.ENGLISH, today.getDay());
  
  // displaying date
  lbldate.text = `${dtlib.getMonthNameShort(dtlib.LANGUAGES.ENGLISH, today.getMonth())}  ${ dtlib.zeroPad(today.getDate())}`;
  
  
  // only animating vortex on normal time change, not on screen wake up
  if (!screenJustAwoke) {
    notVortex.style.display = "none"; vortex.style.display = "inline"
    animateVortex(50, () => { notVortex.style.display = "inline"; vortex.style.display = "none"}) 
  }
  screenJustAwoke = false;
}

// on display on/off set the flag
let screenJustAwoke = true;
display.onchange = () => {
  screenJustAwoke = display.on;
  if (display.on) {
    hrm.start();
  } else {
    hrm.stop();
  }
}

// reading time format preferemces
dtlib.timeFormat = preferences.clockDisplay == "12h" ? 1: 0;

// Update the clock every minute
clock.granularity = "minutes";

// Update the clock every tick event
clock.ontick = () => updateClock();
updateClock();


//battery
updateBattery(Math.floor(battery.chargeLevel));
battery.onchange = () => {updateBattery(Math.floor(battery.chargeLevel))};

// Message is received
messaging.peerSocket.onmessage = evt => {
  
  switch (evt.data.key) {
    case "showDigitalTime":
          userSettings.showDigitalTime = (evt.data.newValue == "true");
          showHideDigitalTime(userSettings.showDigitalTime);
          break;
    case "showDow":
          userSettings.showDow = (evt.data.newValue == "true");
          showHideDow(userSettings.showDow);
          break;
    case "showDate":
          userSettings.showDate = (evt.data.newValue == "true");
          showHideDate(userSettings.showDate);
          break;
    case "showBattery":
          userSettings.showBattery = (evt.data.newValue == "true");
          showHideBattery(userSettings.showBattery);
          break;
    case "showHeartRate":
          userSettings.showHeartRate = (evt.data.newValue == "true");
          showHideHeartRate(userSettings.showHeartRate);
          break;
    case "showSeconds":
          userSettings.showSeconds = (evt.data.newValue == "true");
          showHideSeconds(userSettings.showSeconds);
          break;

  };
 
  screenJustAwoke = true; // to prevent vortex animation
  updateClock(); // and refresh the clock
      
}

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.close = () => {
  console.log("App Socket Closed");
};


