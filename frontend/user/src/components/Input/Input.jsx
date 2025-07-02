import { useState } from "react";
import style from "./Input.module.scss";
import Icon from "../Icon/Icon";

export default function Input({
  value,
  setValue,
  type = "text",
  placeholder = "",
  label,
  isLocked = false,
  ...props
}) {
  const [totalType, setTotalType] = useState(type);
  const [visible, setVisibility] = useState(false);

  const changeVisibility = (e) => {
    e.preventDefault();
    setVisibility((prev) => !prev);
    if (type !== totalType) {
      setTotalType(type);
    } else {
      setTotalType("text");
    }
  };

  const changeValue = (e) => {
    if (isLocked) return;
    if (type === "tel") {
      const phone = e.target.value.replace(/\D/g, "");
      setValue(phone);
      return;
    }
    setValue(e.target.value);
  };

  return (
    <div className={style.container}>
      {label && <p className={style.label}>{label}</p>}
      <div className={style.inputOverlay}>
        <input
          {...props}
          value={value}
          type={totalType}
          placeholder={placeholder}
          className={style.input}
          onChange={changeValue}
        />
        {type === "password" && (
          <button
            type="button"
            className={style.changeVisibilityBtn}
            onClick={changeVisibility}
          >
            <Icon width={16} name={visible ? "open-eye" : "closed-eye"} />
          </button>
        )}
      </div>
    </div>
  );
}
