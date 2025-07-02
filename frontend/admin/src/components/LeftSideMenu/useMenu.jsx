import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import MenuDropDown from "../MenuDropDown";
import style from "./style.module.scss";
import classNames from "classnames";
import Icon from "../Icon";

export default function useMenu(links) {
  const renderMenu = routes => {
    if (!Array.isArray(routes)) {
      return renderItem(routes, false);
    }

    return routes.map(link => renderItem(link));
  };

  const memoizedMenu = useMemo(() => renderMenu(links), [links]);

  function renderItem(link, once = true) {
    return link.type === "link" ? (
      <NavLink
        className={({ isActive }) =>
          classNames({
            [style.menuLink]: once,
            [style.dropDown__item]: !once,
            [style.activeLink]: isActive,
          })
        }
        key={link.path}
        to={link.path}>
        <div className={style.linkHeader}>
          {link.icon && <Icon width="24" name={link.icon} />}
          {link.name}
        </div>
      </NavLink>
    ) : (
      <MenuDropDown
        key={link.name}
        header={
          <div className={style.linkHeader}>
            <Icon width="24" name={link.icon} />
            {link.name}
          </div>
        }
        data={link.links}
        element={item => renderMenu(item)}
      />
    );
  }

  return memoizedMenu;
}
