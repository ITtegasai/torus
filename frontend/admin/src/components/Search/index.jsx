import React, { useEffect, useId, useState } from "react";
import Icon from "../Icon";
import style from "./style.module.scss";

export default function Search({ onClick, onChange }) {
  const uniqueId = useId();

  const [value, setValue] = useState("");

  const handleClick = () => {
    onClick && onClick(value);
  };

  const enterClick = ({ key }) => {
    if (key === "Enter") {
      handleClick();
    }
  };

  useEffect(() => {
    addEventListener("keydown", enterClick);

    return () => {
      removeEventListener("keydown", enterClick);
    };
  });

  const handleOnChange = val => {
    setValue(val);
    onChange && onChange(val);
  };

  return (
    <div className={style.search}>
      <input
        className={style.search__input}
        type="text"
        placeholder="Начните вводить..."
        id={uniqueId}
        value={value}
        onChange={e => handleOnChange(e.target.value)}
      />
      <label htmlFor={uniqueId}>
        <button onClick={handleClick} className={style.search__btn}>
          <Icon name="search" width={16} />
        </button>
      </label>
    </div>
  );
}
