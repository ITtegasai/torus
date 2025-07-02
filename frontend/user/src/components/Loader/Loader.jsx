import { createPortal } from "react-dom";
import style from "./Loader.module.scss";

const Loader = () => {
  return createPortal(
    <div className={style.container}>
      <span className={style.loader}></span>
    </div>,
    document.body
  );
};

export default Loader;
