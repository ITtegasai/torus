import { useContext, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "../Logo/Logo";
import style from "./LeftMenu.module.scss";
import userImage from "../../assets/images/user-image.png";
import Icon from "../Icon/Icon";
import classNames from "classnames";
import { WSContext } from "../../context/WebSocketContext";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import { useCookies } from "react-cookie";

export const LeftMenu = ({ links, isOpen, setOpenMenu }) => {
  const location = useLocation();
  const { user } = useContext(WSContext);
  const [cookie] = useCookies(["access_token"]);

  const userPhoto = user ? import.meta.env.VITE_MAIN_URL + "/images/" + user?.uid + ".jpg" : userImage;

  useEffect(() => {
    setOpenMenu(false);
  }, [location]);

  const refLink = user
    ? `${import.meta.env.VITE_FRONT_DOMAIN}/main?referrer=${user.referal_link}&user=${user.username}`
    : "";

  const handleMobileShare = async () => {
    try {
      await navigator?.share({
        title: "Реферальная ссылка",
        text: "",
        url: refLink,
      });
    } catch (error) {
      console.log("Ошибка при шаринге", error);
    }
  };

  const notStructure = path => {
    return user?.is_agent || path !== "/structure";
  };

  return (
    <div
      className={classNames(style.container, {
        [style.containerClosed]: !isOpen,
      })}>
      <Logo />
      <button onClick={() => setOpenMenu(false)} className={style.crossBtn}>
        <Icon name="cross" width={24} />
      </button>
      <div className={style.userInfo}>
        <ImageWithFallback className={style.userImage} src={userPhoto} alt="user-image" fallbackSrc={userImage} />
        <h5 className={style.userName}>{user?.email}</h5>
        <p className={style.userNickname}>{user?.username}</p>
      </div>
      <nav className={style.nav}>
        <ul className={style.navList}>
          {links.map((link, i) => {
            if (link.visible && notStructure(link.path)) {
              // if (link.isLo && user?.lo < 1) return null;
              return (
                <li key={i} className={style.navItem}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      classNames(style.link, {
                        [style.activeLink]: isActive,
                        [style.nonActiveLink]: !isActive,
                      })
                    }>
                    <Icon width={20} name={link.icon} />
                    <p>{link.title}</p>
                  </NavLink>
                </li>
              );
            }
          })}

          {user && user.role > 2 && (
            <li className={style.navItem}>
              <a
                href={`${import.meta.env.VITE_ADMIN_URL}?token=${cookie?.access_token}`}
                target="_blank"
                className={style.link}
                rel="noreferrer">
                <Icon width={20} name="admin" />
                <p>Админ панель</p>
              </a>
            </li>
          )}
        </ul>
        {user && user?.is_agent && (
          <div className={style.reffLink}>
            <div className={style.reffLink__main}>
              <label className={style.reffLink__label}>Реферальная ссылка:</label>
              <div className={style.reffLink__link}>{refLink}</div>
            </div>
            <CopyToClipboard
              text={encodeURI(refLink)}
              onCopy={() => toast.success(" Реферальная ссылка успешно скопирована")}>
              <button className={style.reffLink__actionBtn}>
                <Icon name="link" width={24} />
              </button>
            </CopyToClipboard>
            <button onClick={handleMobileShare} className={style.reffLink__actionBtn}>
              <Icon name="share" width={24} />
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};