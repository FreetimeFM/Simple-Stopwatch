// Stopwatch object.
class Stopwatch {
  constructor() {
    const decisecond_span = document.getElementById('decisecond');
    const second_span = document.getElementById('second');
    const minute_span = document.getElementById('minute');
    const hour_span = document.getElementById('hour');
    const lapTimes_list = document.getElementById('lap-times');
    const start_button = document.getElementById('start');
    const stop_button = document.getElementById('stop');

    start_button.addEventListener('click', () => {
      sw.start();
    });

    stop_button.addEventListener('click', () => {
      sw.stop();
    });

    // Getter for duration.
    Object.defineProperty(this, 'duration', {
      get: function() {
        return duration;
      },
    });

    // if true, timer will be displayed on console.
    this.displayTimer = function(value) {
      isDisplayed = value;
    };

    this.setDuration = function(value) {
      duration = value;
      updateHTMLTimerNow();
    };

    // Increments duration variable. To be run when after every second.
    let incrementDuration = function() {
      duration++;
      updateHTMLTimer();
    };

    // Starts the stopwatch.
    this.start = function() {

      if (isRunning) {
        this.lap();

      } else {
        // start stopwatch.
        timer.start();
        isRunning = true;

        updateHTMLTimerNow();
      }
      changeStartButtonName();
      changeStopButtonName();
    };

    // Stops the stopwatch.
    this.stop = function() {

      if (isRunning) {
        timer.stop();
        isRunning = false;
        updateHTMLTimerNow();

      } else {
        this.reset();
      }
      changeStartButtonName();
      changeStopButtonName();
    };

    this.lap = () => {

      if (isReset) {
        lapTimes_list.innerHTML = ``;
      }
      isReset = false;

      let lapTime = [
        calculateHour(),
        calculateMinute(),
        calculateSecond(),
        duration % 10,
      ];

      if (lapTimeCount === 1) {
        lapTimes_list.innerHTML = `<li>${lapTimeCount}:- ${lapTime[0]}:${lapTime[1]}:${lapTime[2]}.${lapTime[3]}</li>`;
      } else {
      let existingList = lapTimes_list.innerHTML;
        let difference = [
          Math.abs(previousLapTime[0] - lapTime[0]),
          Math.abs(previousLapTime[1] - lapTime[1]),
          Math.abs(previousLapTime[2] - lapTime[2]),
          Math.abs(previousLapTime[3] - lapTime[3]),
        ];

        lapTimes_list.innerHTML = `<li>${lapTimeCount}:- ${lapTime[0]}:${lapTime[1]}:${lapTime[2]}.${lapTime[3]} <em>(${difference[0]}:${difference[1]}:${difference[2]}.${difference[3]})</em></li>${existingList}`;
      }
      previousLapTime = lapTime;
      lapTimeCount++;
    };

    this.reset = function() {
      duration = 0;
      updateHTMLTimerNow();
      lapTimes_list.innerHTML = `<li>Click the 'Lap' button while the stopwatch is running.</li>
      <li>Lap times will be displayed here.</li>`;
      previousLapTime = undefined;
      lapTimeCount = 1;

      isReset = true;
    };

    const calculateSecond = (duration = this.duration) => {
      return Math.floor((duration / 10) % 60);
    };

    const calculateMinute = (duration = this.duration) => {
      return Math.floor((duration / 600) % 60);
    };

    const calculateHour = (duration = this.duration) => {
      return Math.floor((duration / 36000) % 60);
    };

    const updateDecisecondSpan = function () {
      decisecond_span.innerHTML = duration % 10;
    };

    const updateSecondSpan = function () {
      let seconds = calculateSecond();

      if (seconds < 10) {
        second_span.innerHTML = `0${seconds}`;

      } else {
        second_span.innerHTML = seconds;
      }
    };

    const updateMinuteSpan = function () {
      let minutes = calculateMinute();

      if (minutes < 10) {
        minute_span.innerHTML = `0${minutes}`;

      } else {
        minute_span.innerHTML = minutes;
      }
    };

    const updateHourSpan = function () {
      let hours = calculateHour();

      if (hours < 10) {
        hour_span.innerHTML = `0${hours}`;

      } else if (hours > 98) {
        stop();

      } else {
        hour_span.innerHTML = hours;
      }
    };

    const updateHTMLTimer = function() {
      updateDecisecondSpan();

      if (duration % 10 == 0) {
        updateSecondSpan();
      }

      if (duration % 600 == 0) {
        updateMinuteSpan();
      }

      if (duration % 36000 == 0) {
        updateHourSpan();
      }
    };

    const updateHTMLTimerNow = function() {
      updateDecisecondSpan();
      updateSecondSpan();
      updateMinuteSpan();
      updateHourSpan();
    };

    let changeStartButtonName = () => {

      if (isRunning) {
        start_button.innerHTML = 'Lap';

      } else {
        start_button.innerHTML = 'Start';
      }
    };

    let changeStopButtonName = () => {

      if (isRunning) {
        stop_button.innerHTML = 'Stop';

      } else {
        stop_button.innerHTML = 'Reset';
      }
    };

    let duration = 0;
    let timer = new Timer(incrementDuration, 100);
    let isRunning = false,
      isReset = true;
    let previousLapTime = undefined;
    let lapTimeCount = 1;
  }
}

/**
 * https://stackoverflow.com/a/44337628 by Leon Williams.
 * Self-adjusting interval to account for drifting.
 * Code adapted by A Baretto.
 *
 * @param {function} workFunc  Callback containing the work to be done
 *                             for each interval
 * @param {int}      interval  Interval speed (in milliseconds) - This
 * @param {function} errorFunc (Optional) Callback to run if the drift
 *                             exceeds interval
 */
class Timer {
  constructor(workFunc, interval) {
    var that = this;
    var expected, timeout;
    this.interval = interval;

    this.start = function() {
      expected = Date.now() + this.interval;
      timeout = setTimeout(step, this.interval);
    };

    this.stop = function() {
      clearTimeout(timeout);
    };

    function step() {
      var drift = Date.now() - expected;
      if (drift > that.interval)
        console.warn('Timer is drifting from interval.');
      workFunc();
      expected += that.interval;
      timeout = setTimeout(step, Math.max(0, that.interval - drift));
    }
  }
}

const sw = new Stopwatch();
console.log('Script running.');
