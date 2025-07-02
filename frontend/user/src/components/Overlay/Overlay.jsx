import React, { useState } from "react";
import { LeftMenu } from "../LeftMenu/LeftMenu";
import Header from "../Header/Header";
import style from "./Overlay.module.scss";
import { useLocation } from "react-router-dom";
import { links } from "../../routes.jsx";

export default function Overlay({ children }) {
  const location = useLocation();

  const getTitle = pathname => {
    const matchedLink = links.find(link => {
      const linkPath = link.path.replace(/:\w+/g, "\\w+");
      const regex = new RegExp(`^${linkPath}$`);
      return regex.test(pathname);
    });
    return matchedLink ? matchedLink.title : "No Match Page";
  };

  const title = getTitle(location.pathname);

  const [isOpenMenu, setOpenMenu] = useState(false);
  return (
    <div className={style.container}>
      <LeftMenu links={links} isOpen={isOpenMenu} setOpenMenu={setOpenMenu} />
      <div className={style.content}>
        <Header title={title} setOpenMenu={setOpenMenu} />
        <div className={style.mainContent}>{children}</div>
      </div>
    </div>
  );
}
