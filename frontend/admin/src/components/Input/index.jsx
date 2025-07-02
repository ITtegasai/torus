import { memo } from "react";
import style from "./style.module.scss";

function Input({ value = "", setValue, type = "text", placeholder = "", label, ...props }) {
  const changeValue = e => {
    if (type === "tel") {
      const phone = e.target.value.replace(/\D/g, "");
      setValue(phone);
      return;
    }
    setValue(e.target.value);
  };
  return (
    <label className={style.customInput}>
      {label}
      <input
        value={value}
        type={type}
        placeholder={placeholder}
        className={style.input}
        onChange={changeValue}
        {...props}
      />
    </label>
  );
}

export default memo(Input);
