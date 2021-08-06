/*jshint esversion: 7 */

//
// Utilities
//

let utilities = {};

utilities.isString = (x) => {
  return Object.prototype.toString.call(x) === "[object String]";
};

utilities.shortenStr = s => {
  return s.split('-').map(w => w.substr(0, 1)).reduce((a, c) => a + c);
};

utilities.containsAll = (arr1, arr2) =>
  arr2.every(arr2Item => arr1.includes(arr2Item));

utilities.sameMembers = (arr1, arr2) =>
  utilities.containsAll(arr1, arr2) && utilities.containsAll(arr2, arr1);

utilities.forLoopMinMax = (array) => {
  let min = array[0],
    max = array[0];
  for (let i = 1; i < array.length; i++) {
    let value = array[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return [min, max];
};

utilities.roundNumber = (value, precision = 1) => {
  return Number(Number.parseFloat(value).toPrecision(precision));
};

utilities.histogram = (array, numbuckets, min, max) => {
  let i, index, val, sval,
    range = max - min,
    bucketSize = range / numbuckets,
    scale = numbuckets / range,
    buckets = Array(numbuckets);

  for (i = 0; i < buckets.length; i++) {
    let bucketStart = utilities.roundNumber(i * bucketSize + min, 3);
    buckets[i] = [bucketStart, 0];
  }
  for (i = 0; i < array.length; i++) {
    val = array[i];
    if (val >= min && val <= max) {
      sval = (val - min) * scale;
      index = Math.floor(sval);
      if (index < 0 || index >= numbuckets) {
        // console.log(index);
      } else {
        buckets[index][1] += 1;
      }
    }
  }
  return buckets;
};

utilities.getLastItem = thePath => thePath.substring(thePath.lastIndexOf('/') + 1);

// event listener wrapper: discard events until <wait> time has passed
// https://www.joshwcomeau.com/snippets/javascript/debounce/
utilities.debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

utilities.getMonthDayStr = (d) => {
  return (d.getMonth() + 1).toString().padStart(2, '0') + (d.getDay() + 1).toString().padStart(2, '0');
};

utilities.getMonthDayStrNow = () => {
  let now = new Date();
  return utilities.getMonthDayStr(now);
};

utilities.getMonthDayNow = () => {
  let now = new Date();
  return Number.parseInt(utilities.getMonthDayStr(now));
};

utilities.bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) return `${bytes} ${sizes[i]})`;
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
};

export default utilities;
