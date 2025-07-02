// src/components/RangeSlider.jsx

import React, { useState } from "react";
import styles from "./RangeSlider.module.scss";

const RangeSlider = ({
  max,
  min,
  currentMin = min,
  currentMax = max,
  step = 1,
  onChange,
}) => {
    const [currMin , setCurrMin] = useState(currentMin);
    const [currMax , setCurrMax] = useState(currentMax);
  const [isFirstClicked, setFirstClicked] = useState(false);
  const [isSecondClicked, setSecondClicked] = useState(false);

  const onMouseDown = (slider) => {
    if (slider === "min") {
      setFirstClicked(true);
    } else {
      setSecondClicked(true);
    }
  };

  const onMouseUp = () => {
    setFirstClicked(false);
    setSecondClicked(false);
  };

  const onMouseMove = (e, slider) => {
    console.log(e.movementX, slider)
    if(slider === 'min' && isFirstClicked) {
        if(currMin > min && currMin + step < max) {
            setCurrMin((prev) => prev + e.movementX)
        }
        return 
    }

    if(slider === 'max' && isSecondClicked) {
        console.log(e.movementX)
        return 
    }
  }

  const MIN = 0;
  const MAX = 100;
  const range = MAX - MIN;
  const oneStepSize = range / (max - min);

  console.log( oneStepSize,currMax)

  const currMinPos = oneStepSize * currMin;
  const currMaxPos = oneStepSize * currMax;

  return (
    <div className={styles.overlay}>
      <div className={styles.slider}>
        <div
          onMouseDown={() => onMouseDown("min")}
          onMouseUp={onMouseUp}
          onMouseMove={(e) => onMouseMove(e, 'min')}
          className={styles.slider__dot}
          style={{ "--left": `${currMinPos}%` }}
        ></div>
        <div
          onMouseDown={() => onMouseDown("max")}
          onMouseUp={onMouseUp}
          onMouseMove={(e) => onMouseMove(e, 'max')}
          className={styles.slider__dot}
          style={{ "--left": `${currMaxPos}%` }}
        ></div>
      </div>
    </div>
  );
};

export default RangeSlider;
