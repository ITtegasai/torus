import { createElement } from "react";
import style from "./style.module.scss";
import classNames from "classnames";

const variants = {
  primary: style.primaryBtn,
  secondary: style.secondaryBtn,
};

export default function Button({ type = "button", variant = "primary", children, ...props }) {
  const classes = classNames(variants[variant], style.btn);
  return createElement(type, { ...props, className: classes }, children);
}
