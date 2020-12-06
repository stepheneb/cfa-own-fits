/*jshint esversion: 6 */

//
// Utilities
//

const containsAll = (arr1, arr2) =>
  arr2.every(arr2Item => arr1.includes(arr2Item));

const sameMembers = (arr1, arr2) =>
  containsAll(arr1, arr2) && containsAll(arr2, arr1);

const forLoopMinMax = (array) => {
  let min = array[0],
    max = array[0];
  for (let i = 1; i < array.length; i++) {
    let value = array[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return [min, max];
};

let roundNumber = (value, precision = 1) => {
  return Number(Number.parseFloat(value).toPrecision(precision));
};

const histogram = (array, numbuckets, min, max) => {
  let i, index, val, sval,
    range = max - min,
    bucketSize = range / numbuckets,
    scale = numbuckets / range,
    buckets = Array(numbuckets);

  for (i = 0; i < buckets.length; i++) {
    let bucketStart = roundNumber(i * bucketSize + min, 3);
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

export { forLoopMinMax, roundNumber, histogram, containsAll, sameMembers };
