import document from "document";
import clock from "clock";
import {display} from "display";
import dtlib from "../common/datetimelib";

let vortex = document.getElementById("vortex");
let analogClock = document.getElementById("analog-watch-hands");

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function animateVortex(delay, callback) {
  
  let frame = 1;
  let i = setInterval(function(){
      vortex.href = `frames/frame_apngframe${pad(frame,2)}.png`;
      frame++;
      if (frame > 60) {
          clearInterval(i);
          if (callback) callback();
      }
  }, delay)
}

function updateClock() {
  
  // only animating vortex on normal time change, not on screen wake up
  if (!screenJustAwoke) {
    analogClock.style.display = "none";
    vortex.style.display = "inline"
    animateVortex(50, () => { analogClock.style.display = "inline"; vortex.style.display = "none"}) 
  }
  screenJustAwoke = false;
}

// on display on/off set the flag
let screenJustAwoke = true;
display.onchange = () => {
  screenJustAwoke = display.on;
}

// reading time format preferemces
dtlib.timeFormat = preferences.clockDisplay == "12h" ? 1: 0;

// Update the clock every minute
clock.granularity = "minutes";

// Update the clock every tick event
clock.ontick = () => updateClock();
updateClock();




