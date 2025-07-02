import React, { useState } from "react";
import style from './RadioBtn.module.scss';
import classNames from "classnames";

export const CustomRadioButton = ({ label, value, checked, onChange }) => {
  return (
    <label className={classNames(style.radioButton, {[style.radioButtonChecked]: checked})}>
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className={style.radioInput}
      />
      <span className={style.radioCustom}>
        <span className={style.radioCustomDot}></span>
      </span>
      {label}
    </label>
  );
};
