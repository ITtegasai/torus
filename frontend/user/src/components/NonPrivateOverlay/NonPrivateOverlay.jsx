import { Navigate, useLocation } from "react-router-dom";
import LogoBlack from "../LogoBlack/LogoBlack";
import Select from "../Select/Select";
import style from "./NonPrivateOverlay.module.scss";
import { links } from "../../routes";
import { useCookies } from "react-cookie";
import Lang from "../Lang/Lang";


export default function NonPrivateOverlay({ children }) {
  const location = useLocation();
  const [cookies, setCookie] = useCookies(['access_token']);
  const isAuthenticated = Boolean(cookies?.access_token?.length);

  if(isAuthenticated) {
    return <Navigate to={'/main'}/>
  }

  const title =
    links.find((link) => location.pathname === link.path)?.title ||
    "Not Found Page";
  return (
    <div className={style.overlay}>
      <div className={style.mainPart}>
        <div className={style.header}>
          <LogoBlack />
          <Lang/>
        </div>
        <div className={style.content}>
          <div className={style.title}>{title}</div>
          <div className={style.children}>{children}</div>
        </div>
      </div>
      <div className={style.background}></div>
    </div>
  );
}
