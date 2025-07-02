import classNames from "classnames";
import style from "./Button.module.scss";

const buttonTypesClass = {
  primary: style.buttonPrimary,
  secondary: style.buttonSecondary,
  outlined: style.buttonOutlined
};

export default function Button({ type = "primary", children, ...props }) {
  return (
    <button
      {...props}
      className={classNames(style.button, buttonTypesClass[type])}
    >
      {children}
    </button>
  );
}
