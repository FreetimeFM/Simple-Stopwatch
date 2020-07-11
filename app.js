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
      start();
    });

    stop_button.addEventListener('click', () => {
      stop();
    });

    Object.defineProperty(this, 'duration', {
      get: () => {
        return duration;
      },
      set: elapsedDeciSeconds => {
        if (!Number.isInteger(elapsedDeciSeconds))
          throw new Error('Invalid input');
        duration = elapsedDeciSeconds;
        updateHTMLTimerNow();
      },
    });

    Object.defineProperty(this, 'durationInSeconds', {
      get: () => {
        return calculateSeconds();
      },
      set: elapsedSeconds => {
        if (!Number.isInteger(elapsedSeconds)) throw new Error('Invalid input');
        duration = elapsedSeconds * 10;
        updateHTMLTimerNow();
      },
    });

    // Increments duration variable. To be run when after every second.
    const incrementDuration = () => {
      duration++;
      updateHTMLTimer();
    };

    // Starts the stopwatch.
    const start = () => {
      if (isRunning) {
        lap();
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
    const stop = () => {
      if (isRunning) {
        timer.stop();
        isRunning = false;
        updateHTMLTimerNow();
      } else {
        reset();
      }
      changeStartButtonName();
      changeStopButtonName();
    };

    const lap = () => {
      if (isReset) {
        lapTimes_list.innerHTML = ``;
        isReset = false;
      }

      const currentLapTime = duration;
      let lapTime = [
        calculateHours(currentLapTime),
        calculateMinutes(currentLapTime),
        calculateSeconds(currentLapTime),
        currentLapTime % 10,
      ];

      for (let i = 0; i < lapTime.length - 1; i++) {
        if (lapTime[i] < 10) lapTime[i] = `0${lapTime[i]}`;
      }

      if (lapTimeCount === 1) {
        lapTimes_list.innerHTML = `<li>${lapTimeCount}:- ${lapTime[0]}:${lapTime[1]}:${lapTime[2]}.${lapTime[3]}</li>`;
      } else {
        let existingList = lapTimes_list.innerHTML;
        let difference = currentLapTime - previousLapTime;

        let differenceArray = [
          calculateHours(difference),
          calculateMinutes(difference),
          calculateSeconds(difference),
          difference % 10,
        ];

        for (let i = 0; i < differenceArray.length - 1; i++) {
          if (differenceArray[i] < 10)
            differenceArray[i] = `0${differenceArray[i]}`;
        }

        lapTimes_list.innerHTML = `<li>${lapTimeCount}:- ${lapTime[0]}:${lapTime[1]}:${lapTime[2]}.${lapTime[3]} <em>(${differenceArray[0]}:${differenceArray[1]}:${differenceArray[2]}.${differenceArray[3]})</em></li>${existingList}`;
      }

      previousLapTime = currentLapTime;
      lapTimeCount++;
    };

    const reset = () => {
      duration = 0;
      updateHTMLTimerNow();

      lapTimes_list.innerHTML = `<li>Click the 'Lap' button while the stopwatch is running.</li>
      <li>Lap times will be displayed here.</li>`;
      previousLapTime = undefined;
      lapTimeCount = 1;

      isReset = true;
    };

    const calculateSeconds = (duration = this.duration) => {
      return Math.floor((duration / 10) % 60);
    };

    const calculateMinutes = (duration = this.duration) => {
      return Math.floor((duration / 600) % 60);
    };

    const calculateHours = (duration = this.duration) => {
      return Math.floor((duration / 36000) % 60);
    };

    const updateDecisecondSpan = () => {
      decisecond_span.innerHTML = duration % 10;
    };

    const updateSecondSpan = () => {
      let seconds = calculateSeconds();

      if (seconds < 10) {
        second_span.innerHTML = `0${seconds}`;
      } else {
        second_span.innerHTML = seconds;
      }
    };

    const updateMinuteSpan = () => {
      let minutes = calculateMinutes();

      if (minutes < 10) {
        minute_span.innerHTML = `0${minutes}`;
      } else {
        minute_span.innerHTML = minutes;
      }
    };

    const updateHourSpan = () => {
      let hours = calculateHours();

      if (hours < 10) {
        hour_span.innerHTML = `0${hours}`;
      } else if (hours > 98) {
        stop();
      } else {
        hour_span.innerHTML = hours;
      }
    };

    const updateHTMLTimer = () => {
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

    const updateHTMLTimerNow = () => {
      updateDecisecondSpan();
      updateSecondSpan();
      updateMinuteSpan();
      updateHourSpan();
    };

    const changeStartButtonName = () => {
      if (isRunning) {
        start_button.innerHTML = 'Lap';
      } else {
        start_button.innerHTML = 'Start';
      }
    };

    const changeStopButtonName = () => {
      if (isRunning) {
        stop_button.innerHTML = 'Stop';
      } else {
        stop_button.innerHTML = 'Reset';
      }
    };

    let duration = 0;
    const timer = new Timer(incrementDuration, 100);
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

    this.start = function () {
      expected = Date.now() + this.interval;
      timeout = setTimeout(step, this.interval);
    };

    this.stop = function () {
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
console.log('Script loaded.');
