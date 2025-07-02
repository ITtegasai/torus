import style from "./CustomCheckbox.module.scss";
import Icon from "../Icon/Icon";

const CustomCheckbox = ({ label, checked, onChange, grey }) => {
  return (
    <label className={style.customCheckbox}>
      <input type="checkbox" checked={checked} onChange={onChange} className={style.customCheckboxInput} />
      <div className={style.customCheckboxCheckmark} style={{ ...(grey && { backgroundColor: "#F1F1F1" }) }}>
        <Icon width={40} name="done" style={{ ...(grey && { color: "#3d4144" }) }} />
      </div>
      {label && <span className={style.customCheckboxLabel}>{label}</span>}
    </label>
  );
};

export default CustomCheckbox;
