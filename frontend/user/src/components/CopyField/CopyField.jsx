import React from "react";
import style from "./CopyField.module.scss";
import Icon from "../Icon/Icon";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";

export default function CopyField({ label, text }) {
  const onCopy = () => {
    toast.success(" Текст успешно скопирован");
  };
  return (
    <div className={style.copyField}>
      {label && <label className={style.label}>{label}</label>}
      <CopyToClipboard className={style.field} text={text} onCopy={onCopy}>
        <div>
          <p>{text}</p>
          <Icon name="copy-file" width={26} />
        </div>
      </CopyToClipboard>
    </div>
  );
}
