import React from "react";
import '../index.css';
import '../SortingVisualizer.css';
import * as sortingAlgorithms from '../assets/sortingAlgorithms';
const PRIMARY_COLOR = 'var(--ctp-accent)';
const SECONDARY_COLOR = 'var(--ctp-red)';
export class SortingVisualizer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            array: [],
            animationSpeed: 5,
            numberOfArrayBars: 120,
        };
    }

    componentDidMount() {
        this.resetArray();
    }

    resetArray() {
        const array = [];
        const { numberOfArrayBars } = this.state;
        for (let i = 0; i < numberOfArrayBars; i++) {
            array.push(randomIntFromInterval(5, 450));
        }
        this.setState({array});
    }

    handleSpeedChange = (event) => {
        this.setState({ animationSpeed: parseFloat(event.target.value) });
    }

    handleBarsChange = (event) => {
        this.setState({ numberOfArrayBars: parseInt(event.target.value) }, () => {
            this.resetArray();
        });
    }

    mergeSort() {
        const auxiliaryArray = this.state.array.slice();
        const animations = sortingAlgorithms.getMergeSortAnimations(auxiliaryArray);
        const speed = this.state.animationSpeed;
        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName('array-bar');
            const isColorChange = i % 3 !== 2;
            if (isColorChange) {
                const [barOneIdx, barTwoIdx] = animations[i];
                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;
                const color = i % 3 === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;
                setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * speed);
            } else {
                setTimeout(() => {
                    const [barOneIdx, newHeight] = animations[i];
                    const barOneStyle = arrayBars[barOneIdx].style;
                    barOneStyle.height = `${newHeight}px`;
                }, i * speed);
            }
        }
    }
quickSort() {
        const auxiliaryArray = this.state.array.slice();
        const animations =
            sortingAlgorithms.getQuickSortAnimations(auxiliaryArray);
        const speed = this.state.animationSpeed;

        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName('array-bar');
            const groupPos = i % 4;

            if (groupPos === 0 || groupPos === 1) {
                const [barOneIdx, barTwoIdx] = animations[i];

                if (barOneIdx === -1 || barTwoIdx === -1) continue;

                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;

                const color =
                    groupPos === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;

                setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * speed);
            } else {
                const [barIdx, newHeight] = animations[i];

                if (barIdx === -1) continue;

                const barStyle = arrayBars[barIdx].style;

                setTimeout(() => {
                    barStyle.height = `${newHeight}px`;
                }, i * speed);
            }
        }
    }

    heapSort() {
        const auxiliaryArray = this.state.array.slice();
        const animations = sortingAlgorithms.getHeapSortAnimations(auxiliaryArray);
        const speed = this.state.animationSpeed;
        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName('array-bar');
            const groupPos = i % 4;

            if (groupPos === 0 || groupPos === 1) {
                const [barOneIdx, barTwoIdx] = animations[i];
                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;
                const color = groupPos === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;

                setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * speed);
            } else {
                const [barIdx, newHeight] = animations[i];
                const barStyle = arrayBars[barIdx].style;
                setTimeout(() => {
                    barStyle.height = `${newHeight}px`;
                }, i * speed);
            }
        }
    }

    bubbleSort() {
        const auxiliaryArray = this.state.array.slice();
        const animations = sortingAlgorithms.getBubbleSortAnimations(auxiliaryArray);
        const speed = this.state.animationSpeed;
        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName('array-bar');
            const groupPos = i % 4;  

            if (groupPos === 0 || groupPos === 1) {
                const [barOneIdx, barTwoIdx] = animations[i];
                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;
                const color = groupPos === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;

                setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * speed);
            } else {
                const [barIdx, newHeight] = animations[i];
                if (barIdx === -1) continue;
                const barStyle = arrayBars[barIdx].style;
                setTimeout(() => {
                    barStyle.height = `${newHeight}px`;
                }, i * speed);
            }
        }
    }
    selectionSort() {
        const animations = sortingAlgorithms.getSelectionSortAnimations(this.state.array.slice());
        const speed = this.state.animationSpeed;
        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName('array-bar');
            const groupPos = i % 4;

            if (groupPos === 0 || groupPos === 1) {
                const [barOneIdx, barTwoIdx] = animations[i];
                if (barOneIdx === -1 || barTwoIdx === -1) continue;
                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;
                const color = groupPos === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;
                setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * speed);
            } else {
                const [barIdx, newHeight] = animations[i];
                if (barIdx === -1) continue;
                const barStyle = arrayBars[barIdx].style;
                setTimeout(() => {
                    barStyle.height = `${newHeight}px`;
                }, i * speed);
            }
        }
    }
radixSort() {
        const auxiliaryArray = this.state.array.slice();
        const animations = sortingAlgorithms.getRadixSortAnimations(auxiliaryArray);
        const speed = this.state.animationSpeed;
        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName('array-bar');
            const groupPos = i % 4;

            if (groupPos === 0 || groupPos === 1) {
                const [barOneIdx, barTwoIdx] = animations[i];
                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;
                const color = groupPos === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;

                setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * speed);
            } else {
                const [barIdx, newHeight] = animations[i];
                const barStyle = arrayBars[barIdx].style;
                setTimeout(() => {
                    barStyle.height = `${newHeight}px`;
                }, i * speed);
            }
        }
    }

    insertionSort() {
        const animations = sortingAlgorithms.getInsertionSortAnimations(this.state.array.slice());
        const speed = this.state.animationSpeed;
        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName('array-bar');
            const groupPos = i % 4;

            if (groupPos === 0 || groupPos === 1) {
                const [barOneIdx, barTwoIdx] = animations[i];

                if (!arrayBars[barOneIdx] || !arrayBars[barTwoIdx]) continue;

                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;
                const color = groupPos === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;

                setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * speed);
            } else {
                const [barIdx, newHeight] = animations[i];
                if (barIdx === -1) continue;
                const barStyle = arrayBars[barIdx].style;
                setTimeout(() => {
                    barStyle.height = `${newHeight}px`;
                }, i * speed);
            }
        }
    }

    render() {
          const {array, animationSpeed, numberOfArrayBars} = this.state;

          return (
              <div className="parent">
                  <div className="div1">
                      <button onClick={() => this.resetArray()}>Generate New Array</button>
                      <button onClick={() => this.mergeSort()}>Merge Sort</button>
                      <button onClick={() => this.quickSort()}>Quick Sort</button>
                      <button onClick={() => this.heapSort()}>Heap Sort</button>
                      <button onClick={() => this.bubbleSort()}>Bubble Sort</button>
                      <button onClick={() => this.selectionSort()}>Selection Sort</button>
                      <button onClick={() => this.radixSort()}>Radix Sort</button>
                      <button onClick={() => this.insertionSort()}>Insertion Sort</button>
                  </div>
<div className="div2">
                        <div className="slider-container">
                            <label htmlFor="speed-slider">Animation Speed: {animationSpeed}ms</label>
                            <input
                                id="speed-slider"
                                type="range"
                                min={1}
                                max={15}
                                step={1}
                                value={animationSpeed}
                                onChange={this.handleSpeedChange}
                            />
                        </div>
                        <div className="slider-container">
                            <label htmlFor="bars-slider">Number of Bars: {numberOfArrayBars}</label>
                            <input
                                id="bars-slider"
                                type="range"
                                min={5}
                                max={120}
                                step={1}
                                value={numberOfArrayBars}
                                onChange={this.handleBarsChange}
                            />
                        </div>
                    </div>
                    <div className="div3 array-container">
                      {array.map((value, idx) => (
                          <div className="array-bar" 
                          key={idx}
                          style={{
                          height: `${value}px`,
                          backgroundColor: PRIMARY_COLOR,
                          }}></div>
                      ))}
                  </div>
              </div>
          );
      }

}
//galing stackoverflow lmao
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default SortingVisualizer;