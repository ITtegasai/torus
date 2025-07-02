import style from "./style.module.scss";
import Icon from "../Icon";

export default function IconedButton({ icon, text, iconSize = [24, 24], ...props }) {
  return (
    <button {...props} className={style.button}>
      <Icon name={icon} width={iconSize[0]} height={iconSize[1]} />
      <p>{text}</p>
    </button>
  );
}
