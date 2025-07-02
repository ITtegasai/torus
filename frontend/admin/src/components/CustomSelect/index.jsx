import React, { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import style from "./style.module.scss";
import classNames from "classnames";

export default function CustomSelect({ title, options = [], initial = null, onChoose, top = false, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(initial ?? -1);
  const [openUpward, setOpenUpward] = useState(false);
  const placeholder = options[currentValue]?.title || title;

  const selectRef = useRef(null);

  const handleClose = e => {
    if (selectRef?.current && !selectRef?.current?.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const handleToggleOpen = e => {
    const selectRect = e.target.closest(`.${style.container}`).getBoundingClientRect();
    const spaceBelow = window.innerHeight - selectRect.bottom;
    const spaceAbove = selectRect.top;

    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      setOpenUpward(true);
    } else {
      setOpenUpward(false);
    }
    setIsOpen(prev => !prev);
  };

  const selectItem = index => {
    setCurrentValue(index);
    setIsOpen(false);
    onChoose && onChoose(options[index].value, name);
  };

  useEffect(() => {
    document.addEventListener("click", handleClose);

    return () => {
      document.removeEventListener("click", handleClose);
    };
  }, []);

  return (
    <div
      ref={selectRef}
      className={classNames(style.container, {
        [style.selectOpen]: isOpen,
        [style.container_top]: top,
      })}>
      <div onClick={handleToggleOpen} className={style.header}>
        <p
          className={classNames(style.select__placeholder, {
            [style.select__placeholder_empty]: currentValue < 0,
          })}>
          {placeholder}
        </p>
        <Icon name="arrow-up" width={24} />
      </div>
      <div
        className={classNames(style.contant, {
          [style.openUpward]: openUpward,
        })}>
        <ul className={style.list}>
          {options.map((option, i) => (
            <li key={i} onClick={() => selectItem(i)}>
              {option.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
