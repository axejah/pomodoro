const timer = document.querySelector("#timer");

const start = document.querySelector("#start");
const stop = document.querySelector("#stop");

const currentTask = document.querySelector("#clock-task");

let updatedWorkSessionDuration;
let updatedBreakSessionDuration;

// See if clock is running or paused
let isClockRunning = false;
let isClockStopped = true;

// Initializing standard Pomodoro values (25mins)
let pomodoroDuration = 1500;
let timeLeftInSession = 1500;
let timeSpentInSession = 0;

let workDurationInput = document.querySelector("#input-work-duration");
let breakDurationInput = document.querySelector("#input-break-duration");

let adjustWorkDurationInput = document.querySelector("#adjust-work-duration");
let adjustBreakDurationInput = document.querySelector("#adjust-break-duration");

workDurationInput.value = "25";
breakDurationInput.value = "5";

// standard break time (5mins)
let breakDuration = 300;

// define work or break
let type = "Standaard";

// set audio
const completedSound = new Audio("../audio/session_completed.mp3");
const startSound = new Audio("../audio/clock_ticking.mp3");

// Start/stop/pause button
start.addEventListener("click", () => {
  pomodoroClock();
  startSound.play();
});

stop.addEventListener("click", () => {
  pomodoroClock(true);
});

// update work time for next session
workDurationInput.addEventListener("input", () => {
  updatedWorkSessionDuration = minuteToSeconds(workDurationInput.value);
});
// update break time for next session
breakDurationInput.addEventListener("input", () => {
  updatedBreakSessionDuration = minuteToSeconds(breakDurationInput.value);
});

// force work and break time input to seconds
const minuteToSeconds = (mins) => {
  return mins * 60;
};

function pomodoroClock(reset) {
  togglePlayPauseIcon(reset);
  if (reset) {
    // should stop the timer
    stopClock();
  } else {
    if (isClockStopped) {
      // should pause timer
      setUpdatedTimers();
      isClockStopped = false;
    }
    if (isClockRunning === true) {
      clearInterval(clockTimer);
      isClockRunning = false;
    } else {
      clockTimer = setInterval(() => {
        stepDown();
        displayTimeLeftInSession();
      }, 1000);
      isClockRunning = true;
    }
    showStopIcon();
  }
}

// calculate ms to h:mm:ss value based on session timer and show in DOM
function displayTimeLeftInSession() {
  const secondsLeft = timeLeftInSession;
  let result = "";
  const seconds = secondsLeft % 60;
  const minutes = parseInt(secondsLeft / 60) % 60;
  let hours = parseInt(secondsLeft / 3600);
  // for correct time formatting add a zero for time values under 10
  function leadingZero(time) {
    return time < 10 ? `0${time}` : time;
  }
  if (hours > 0) result += `${hours}:`;
  result += `${leadingZero(minutes)}:${leadingZero(seconds)}`;
  // write time to DOM (#timer)
  timer.innerText = result.toString();
}

// stop and reset clock function
function stopClock() {
  setUpdatedTimers();
  // make sure to only show work sessions in session log
  if (type === "Standaard") {
    displaySessionLog(type);
  }
  clearInterval(clockTimer);
  isClockStopped = true;
  isClockRunning = false;
  timeLeftInSession = pomodoroDuration;
  displayTimeLeftInSession();
  type = "Standaard";
  timeSpentInSession = 0;
}

// function to determine what type of state you are in and tracks time in state/session
function stepDown() {
  if (timeLeftInSession > 0) {
    timeLeftInSession--;
    timeSpentInSession++;
  } else if (timeLeftInSession === 0) {
    timeSpentInSession = 0;
    if (type === "Standaard") {
      timeLeftInSession = breakDuration;
      displaySessionLog("Standaard");
      type = "Break";
      setUpdatedTimers();
    } else {
      timeLeftInSession = pomodoroDuration;
      type = "Standaard";
      setUpdatedTimers();
      if (currentTask.value === "Break") {
        currentTask.value = workSessionLabel;
      }
      currentTask.disabled = false;
      displaySessionLog("Break");
    }
  }
  displayTimeLeftInSession();
}

// session log
function displaySessionLog(type) {
  const sessionList = document.querySelector("#sessions");
  const li = document.createElement("li");
  if (type === "Standaard") {
    label = currentTask.value ? currentTask.value : "Standaard";
    workSessionLabel = label;
  }
  let elapsedTime = parseInt(timeSpentInSession / 60);
  elapsedTime = elapsedTime > 0 ? elapsedTime : "< 1";
  completedSound.play();
  const text = document.createTextNode(`${label} : ${elapsedTime} minutes`);
  li.appendChild(text);
  sessionList.appendChild(li);
}

// function to set custom updated timers
function setUpdatedTimers() {
  if (type === "Standaard") {
    timeLeftInSession = updatedWorkSessionDuration
      ? updatedWorkSessionDuration
      : pomodoroDuration;
    pomodoroDuration = timeLeftInSession;
  } else {
    timeLeftInSession = updatedBreakSessionDuration
      ? updatedBreakSessionDuration
      : breakDuration;
    breakDuration = timeLeftInSession;
  }
}

const togglePlayPauseIcon = (reset) => {
  const playIcon = document.querySelector("#play-icon");
  const pauseIcon = document.querySelector("#pause-icon");
  if (reset) {
    // when resetting -> always revert to play icon
    if (playIcon.classList.contains("hidden")) {
      playIcon.classList.remove("hidden");
    }
    if (!pauseIcon.classList.contains("hidden")) {
      pauseIcon.classList.add("hidden");
    }
  } else {
    playIcon.classList.toggle("hidden");
    pauseIcon.classList.toggle("hidden");
  }
};

const showStopIcon = () => {
  const stopButton = document.querySelector("#stop");
  stopButton.classList.remove("hidden");
};

// update work time for next session
adjustWorkDurationInput.addEventListener("click", () => {
  if (isClockRunning === false) {
    updatedWorkSessionDuration = minuteToSeconds(workDurationInput.value);
    setUpdatedTimers();
    displayTimeLeftInSession();
  } else {
    updatedWorkSessionDuration = minuteToSeconds(workDurationInput.value);
  }
});
// update break time for next session
adjustBreakDurationInput.addEventListener("click", () => {
  updatedBreakSessionDuration = minuteToSeconds(breakDurationInput.value);
  setUpdatedTimers();
});
