import React, { useContext, useRef, useState } from "react";
import style from "./Header.module.scss";
import userImage from "../../assets/images/user-image.png";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../Icon/Icon";
import Select from "../Select/Select";
import { useCookies } from "react-cookie";
import { userContext } from "../../context/userContext";
import { WSContext } from "../../context/WebSocketContext";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import useIsMobileShare from "../../hooks/useMobileDeviceShared";
import Modal from "../Modal/Modal";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import Lang from "../Lang/Lang";

export default function Header({ setOpenMenu, title }) {
  const removeCookie = useCookies(["cookie-name"])[2];
  const [_, setUser] = useContext(userContext);
  const { ws, user } = useContext(WSContext);
  const navigate = useNavigate();

  const shareModalRef = useRef(null);

  const userPhoto = user ? import.meta.env.VITE_MAIN_URL + "/images/" + user.uid + ".jpg" : userImage;

  const logout = () => {
    removeCookie("access_token");
    setUser(null);
    ws.close(1000);
    navigate("/login");
  };

  const refLink = user
    ? `${import.meta.env.VITE_FRONT_DOMAIN}/main?referrer=${user.referal_link}&user=${user.username}`
    : "";

  const isMobileShare = useIsMobileShare();

  const handleMobileShare = async () => {
    try {
      await navigator.share({
        title: "Реферальная ссылка",
        text: "",
        url: refLink,
      });
    } catch (error) {
      console.log("Ошибка при шаринге", error);
    }
  };

  const shareUrls = [
    {
      icon: "facebook",
      title: "Facebook",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refLink)}`,
    },
    {
      icon: "telegram",
      title: "Telegram",
      link: `https://t.me/share/url?url=${encodeURIComponent(refLink)}`,
    },
    {
      icon: "whatsapp",
      title: "WhatsApp",
      link: `https://api.whatsapp.com/send?text=${encodeURIComponent(refLink)}`,
    },
  ];

  const shareLink = () => {
    if (isMobileShare) {
      handleMobileShare();
      return;
    }
    shareModalRef.current.open();
  };

  return (
    <>
      <div className={style.container}>
        <button onClick={() => setOpenMenu(true)} className={style.burgerMenuBtn}>
          <Icon name="burger-menu" width={24} />
        </button>
        <h3 className={style.title}>{title}</h3>
        <div className={style.controlPanel}>
          {/* {user &&  user?.is_agent && (
            <div className={style.reffLink}>
              <div className={style.reffLink__main}>
                <label className={style.reffLink__label}>
                  Реферальная ссылка:
                </label>
                <div className={style.reffLink__link}>{refLink}</div>
              </div>
              <CopyToClipboard
                text={encodeURI(refLink)}
                onCopy={() =>
                  toast.success(" Реферальная ссылка успешно скопирована")
                }
              >
                <button className={style.reffLink__actionBtn}>
                  <Icon name="link" width={24} />
                </button>
              </CopyToClipboard>

              <button onClick={shareLink} className={style.reffLink__actionBtn}>
                <Icon name="share" width={24} />
              </button>
            </div>
          )} */}
          {/* <Lang/> */}
          <Link to="/profile">
            <ImageWithFallback
              className={style.userImage}
              width={45}
              height={45}
              src={userPhoto}
              alt="user-image"
              fallbackSrc={userImage}
            />
          </Link>
          <button onClick={logout}>
            <Icon width={30} name="log-out" />
          </button>
        </div>
      </div>
      <Modal modalRef={shareModalRef}>
        <div className={style.shareLinks}>
          {shareUrls.map((link, i) => (
            <a key={i} className={style.shareLink} href={link.link} target="_blank" rel="noopener noreferrer">
              <Icon name={link.icon} width={22} />
              {link.title}
            </a>
          ))}
        </div>
      </Modal>
    </>
  );
}
