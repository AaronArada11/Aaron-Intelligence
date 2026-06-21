//mergesort sah
export function getMergeSortAnimations(array) {
  const animations = [];
  if (array.length <= 1) return animations;
  const auxiliaryArray = array.slice();
  mergeSortHelper(array, 0, array.length - 1, auxiliaryArray, animations);
  return animations;
}

function mergeSortHelper(
  mainArray,
  startIdx,
  endIdx,
  auxiliaryArray,
  animations,
) {
  if (startIdx === endIdx) return;
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations);
  mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations);
  doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations);
}

function doMerge(
  mainArray,
  startIdx,
  middleIdx,
  endIdx,
  auxiliaryArray,
  animations,
) {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;
  while (i <= middleIdx && j <= endIdx) {
    animations.push([i, j]);
    animations.push([i, j]);
    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      animations.push([k, auxiliaryArray[i]]);
      mainArray[k++] = auxiliaryArray[i++];
    } else {
      animations.push([k, auxiliaryArray[j]]);
      mainArray[k++] = auxiliaryArray[j++];
    }
  }
  while (i <= middleIdx) {
    animations.push([i, i]);
    animations.push([i, i]);
    animations.push([k, auxiliaryArray[i]]);
    mainArray[k++] = auxiliaryArray[i++];
  }
  while (j <= endIdx) {
    animations.push([j, j]);
    animations.push([j, j]);
    animations.push([k, auxiliaryArray[j]]);
    mainArray[k++] = auxiliaryArray[j++];
  }
}

//quick sort boi parang quick silver
export function getQuickSortAnimations (array) {
  const animations = [];
  if (array.length <= 1) return animations;
  quickSortHelper(array, 0, array.length -1, animations);
  return animations;
}

function quickSortHelper(array, start, end, animations) {
      if (start >= end) {
        return;
    }
    let pivotIdx = partition(array, start, end, animations);
    quickSortHelper(array, start, pivotIdx - 1, animations);
    quickSortHelper(array, pivotIdx + 1, end, animations);
}
function partition(array, start, end, animations) {
    let pivotIdx = start;
    let pivotValue = array[end];
    for (let i = start; i < end;i++) {
      animations.push([i, end]);
      animations.push([i, end]);
      if (array[i] < pivotValue) {
        swap(array, i, pivotIdx);
        animations.push([i, array[i]]);
        animations.push([pivotIdx, array[pivotIdx]]);
        pivotIdx++;
      } else {
        animations.push([-1,-1]);
        animations.push([-1,-1]);
      }
    }
    swap(array, pivotIdx, end);
    animations.push([pivotIdx, end]);
    animations.push([pivotIdx, end]);

    animations.push([pivotIdx, array[pivotIdx]]);
    animations.push([end, array[end]]);
    return pivotIdx;
}

function swap(array, a, b){
  let temp = array[a];
  array[a] = array[b];
  array[b] = temp;

}

//heapsort ano ba yun
function heapify (array, n, i, animations) {
  let largest = i;
  let leftIdx = 2 * i + 1;
  let rightIdx = 2 * i + 2;

  if (leftIdx < n && array[leftIdx] > array[largest]){
    largest = leftIdx;
  }
  if (rightIdx < n && array[rightIdx] > array[largest]){
    largest = rightIdx;
  }

  if (largest != i) {
    animations.push([i, largest]);
    animations.push([i, largest]);
    [array[i], array[largest]] = [array[largest], array[i]];
    animations.push([i, array[i]]);
    animations.push([largest, array[largest]]);
    heapify(array, n, largest, animations);
  }
}

export function getHeapSortAnimations(array) {
  const animations = [];
  const tempArray = array.slice();
  let n = tempArray.length;

  for(let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(tempArray, n, i, animations);
  }
  for(let i = n - 1; i > 0; i--) {
    animations.push([0, i]);
    animations.push([0, i]);
    [tempArray[0], tempArray[i]] = [tempArray[i], tempArray[0]];
    animations.push([0, tempArray[0]]);
    animations.push([i, tempArray[i]]);
    
    heapify(tempArray, i, 0, animations);
  }
  return animations;
}

//bubble sort wow bubblesss
export function getBubbleSortAnimations(array) {
  const animations = [];

  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {

      animations.push([j, j + 1]); 
      animations.push([j, j + 1]); 

      if (array[j] > array[j + 1]) {
        swap(array, j, j + 1);

        animations.push([j, array[j]]);
        animations.push([j + 1, array[j + 1]]);
      } else {
        animations.push([-1, -1]);
        animations.push([-1, -1]);
      }
    }
  }

  return animations;
}


//selection sort ikaw pinili ko hehe<3
export function getSelectionSortAnimations(array) {
  const animations = [];
  const n = array.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      animations.push([minIdx, j]);
      animations.push([minIdx, j]);
      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
      animations.push([-1, -1]);
      animations.push([-1, -1]);
    }
    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      animations.push([i, minIdx]);
      animations.push([i, minIdx]);
      animations.push([i, array[i]]);
      animations.push([minIdx, array[minIdx]]);
    }
  }
  return animations;
}

//radix sort wow radix sort may niche
export function getRadixSortAnimations(array) {
  const animations = [];
  if (array.length <= 1) return animations;
  let sortedArray = [...array];
  const maxNUM = getMAX(sortedArray);

  for (let exp = 1; Math.floor(maxNUM / exp) > 0; exp *= 10) {
    sortedArray = countSort(sortedArray, exp, animations);
  }
  return animations;
}

function getMAX(array) {
  const length = array.length;
  let max = array[0];
  for (let i = 1; i < length; i++) {
    if (array[i] > max) max = array[i];
  }
  return max;
}

function countSort(array, exp, animations) {
  const length = array.length;
  let output = new Array(length);
  let count = new Array(10).fill(0);

  for (let i = 0; i < length; i++) {
    const digit = Math.floor(array[i] / exp) % 10;
    count[digit]++;
  }

  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }

  for (let i = length - 1; i >= 0; i--) {
    const digit = Math.floor(array[i] / exp) % 10;
    output[count[digit] - 1] = array[i];
    count[digit]--;
  }

  for (let i = 0; i < length; i++) {
    animations.push([i, i]);
    animations.push([i, i]);
    animations.push([i, output[i]]);
    animations.push([i, output[i]]);
    array[i] = output[i];
  }

  return output;
}

//instertion sort IPASOK MO UGHH
export function getInsertionSortAnimations(array) {
  const animations = [];
  const n = array.length;
  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;

    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      animations.push([j, j + 1]);
      animations.push([j, j + 1]);
      animations.push([j + 1, array[j + 1]]);
      animations.push([j + 1, array[j + 1]]);
      j = j - 1;
    }
    array[j + 1] = key;
    animations.push([j + 1, j + 1]);
    animations.push([j + 1, j + 1]);
    animations.push([j + 1, key]);
    animations.push([j + 1, key]);
  }
  return animations;
}
