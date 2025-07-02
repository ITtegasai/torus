import { useState } from "react";
import Icon from "../Icon";
import style from "./style.module.scss";
import classNames from "classnames";

export default function HidingBlock({ header, children, onChange, onToggle }) {
  const [open, setOpen] = useState(false);
  const [isTransition, setTransition] = useState(false);

  const handleToggleOpen = () => {
    setTransition(true);
    setOpen(prev => {
      onToggle && onToggle(!prev);
      return !prev;
    });
  };

  const onTransitionEnd = e => {
    setTransition(false);
    if (e.propertyName === "grid-template-rows") {
      onChange && onChange(open);
    }
  };

  return (
    <div
      className={classNames(style.hidingBlock, {
        [style.hidingBlock_open]: open,
      })}>
      <div onClick={handleToggleOpen} className={style.header}>
        <p>{header}</p>
        <Icon className={classNames(style.icon, { [style.icon__rotate]: open })} name="arrow-up" width={20} />
      </div>
      <div onTransitionEnd={onTransitionEnd} className={style.block}>
        <div className={classNames(style.block__overlay, { [style.block__overlay_visible]: open && !isTransition })}>
          {children}
        </div>
      </div>
    </div>
  );
}
