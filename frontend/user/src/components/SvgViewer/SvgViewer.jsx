import style from "./SvgViewer.module.scss";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import { memo, useRef, useState } from "react";
import classNames from "classnames";

export const SvgViewer = memo(({ children, changeScreen, svgRef, onScaleChange }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState(position);
  const [isClicked, setClicked] = useState(false);
  const [scale, setScale] = useState(1);
  const [withTransition, setTransition] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  const event = useRef(new Event("changeSvgPosition"))
  

  const onMoveHandler = (diffX, diffY) => {
    setPosition((prev) => ({
      y: prev.y + diffY,
      x: prev.x + diffX,
    }));
  };

  const onMouseMove = (event) => {
    if (!isClicked) return;
    const diffY = initialPos.y - event.clientY;
    const diffX = initialPos.x - event.clientX;
    setInitialPos({ y: event.clientY, x: event.clientX });
    onMoveHandler(diffX, diffY);

  };

  const onTouchMove = (event) => {
    if (!isClicked) return;
    const diffY = initialPos.y - event.touches[0].clientY;
    const diffX = initialPos.x - event.touches[0].clientX;
    setInitialPos({ y: event.touches[0].clientY, x: event.touches[0].clientX });
    onMoveHandler(diffX, diffY);
  };

  const onMouseDown = (e) => {
    setInitialPos({ y: e.clientY, x: e.clientX });
    setClicked(true);
    dispatchEvent(event.current)
  };

  const onTouchStart = (e) => {
    setInitialPos({ y: e.touches[0].clientY, x: e.touches[0].clientX });
    setClicked(true);
    dispatchEvent(event.current)
  };

  const onHandleEnd = () => setClicked(false);

  const increaseScale = () => {
    const newValue = scale / 0.7;
    onScaleChange && onScaleChange(newValue)
    setScale((prev) => prev / 0.7);
   dispatchEvent(event.current)

  }
  const decreaseScale = () => {
    const newValue = scale > 0.4 ? scale * 0.7 : scale
    onScaleChange && onScaleChange(newValue)
    setScale((prev) => (prev > 0.4 ? prev * 0.7 : prev));
   dispatchEvent(event.current)
  }
    

  const toStart = () => {
    setTransition(true);
    setPosition({ x: 0, y: 0 });
    setScale(1);
    onScaleChange && onScaleChange(1)
   dispatchEvent(event.current)
  };

  const onWheel = (e) => {
    setTransition(true);

    if (e.deltaY < 0) {
      const newValue = scale / .8;
      onScaleChange && onScaleChange(newValue)
      setScale((prev) => prev / 0.8);
    } else if (e.deltaY > 0) {
      const newValue = scale > 0.4 ? scale * 0.8 : scale / .8;
      onScaleChange && onScaleChange(newValue)
      setScale((prev) => (prev > 0.4 ? prev * 0.8 : prev));
    }

   dispatchEvent(event.current)
  };

  const handleFullScreen = () => {
    changeScreen((prev) => !prev)
    setFullScreen((prev) => !prev)
    dispatchEvent(event.current)
  }

  return (
    <div
      className={classNames(style.svgViewer, {
        [style.fullScreen]: fullScreen,
      })}
    >
      <div className={style.rowGroupBtns}>
        <Button type="outlined" onClick={toStart}>
          В начало структуры
        </Button>
        <Button
          onClick={handleFullScreen}
          className={style.resizeBtn}
          type="outlined"
        >
          {!fullScreen ? (
            <Icon name="resize" width={24} />
          ) : (
            <Icon name="resize-minus" width={24} />
          )}
        </Button>
      </div>
      <div className={style.colGroupBtns}>
        <Button type="outlined" onClick={increaseScale}>
          +
        </Button>
        {scale > 0.4 && (
          <Button type="outlined" onClick={decreaseScale}>
            -
          </Button>
        )}
      </div>
      <svg
        onMouseLeave={onHandleEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
        onMouseUp={onHandleEnd}
        onTouchEnd={onHandleEnd}
        onWheel={onWheel}
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <g
          onTransitionEnd={() => setTransition(false)}
          style={{
            transform: `translate(${-position.x}px, ${-position.y}px)`,
            transition: withTransition ? "all .2s ease" : "none",
            // transformOrigin: "50% 50%",
          }}
        >
          <g
            ref={svgRef}
            style={{
              transform: `scale(${scale})`,
              transition: "all .2s ease",
              transformOrigin: "50% 50%",
            }}
          >
            {children}
          </g>
        </g>
      </svg>
    </div>
  );
});
