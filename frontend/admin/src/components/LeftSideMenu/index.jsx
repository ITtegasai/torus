import React, { useState } from "react";
import style from "./style.module.scss";
import Icon from "../Icon";
import { links } from "../../../routes";
import useMenu from "./useMenu";
import Button from "../Button";
import classNames from "classnames";

export default function LeftSideMenu() {
  const memoizedMenu = useMenu(links);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={style.menuBtn}>
        <Icon width={30} name="burger" />
      </button>
      <div
        onClick={() => setIsOpen(false)}
        className={classNames(style.leftSideMenu, { [style.openedLeftSideMenu]: isOpen })}>
        <button className={style.closeBtn}>
          <Icon width={22} name="cross" />
        </button>
        <Icon className={style.logo} name="logo" width={156} height={84} />
        <div className={style.horizontalLine}></div>
        <nav className={style.menuNav}>{memoizedMenu}</nav>
        <div className={style.logoutBtn}>
          <Button variant="secondary">Выход</Button>
        </div>
      </div>
    </>
  );
}
