import React from "react";
import LogoBlack from "../../components/LogoBlack/LogoBlack";
import Button from "../../components/Button/Button";
import style from './style.module.scss';
import About from "../About";
import { useNavigate } from "react-router-dom";

export default function Default() {
    const navigate = useNavigate();
  return (
    <div className={style.defaultPage}>
      <div className={style.defaultPageOverlay}>
      <header className={style.header}>
        <LogoBlack />
        <div className={style.enterBtn}>
          <Button onClick={() => navigate('/login')}>Войти в кабинет</Button>
        </div>
      </header>
      <div><About/></div>
      </div>
    </div>
  );
}
