import React, { useState } from "react";
import classNames from "classnames";
import Icon from "../Icon";
import style from "./style.module.scss";

export default function MenuDropDown({ header, data, element, styles = "", open = false, ...props }) {
  const [isOpen, setIsOpen] = useState(open);
  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div
      {...props}
      className={classNames(style.dropDown, styles, {
        [style.dropDown_open]: isOpen,
      })}>
      <div className={style.dropDown__header} onClick={handleToggle}>
        <div>{header}</div>
        <Icon className={style.icon__arrow} name="arrow-up" width={24} />
      </div>
      <div className={style.dropDown__contant}>
        <ul>
          {data.map((item, i) => (
            <React.Fragment key={i}>{element(item)}</React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
