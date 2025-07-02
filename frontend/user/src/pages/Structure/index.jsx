import { useContext, useRef, useState } from "react";
import style from "./Structure.module.scss";
import Icon from "../../components/Icon/Icon";
import { CustomRadioButton } from "../../components/RadioBtn/RadioBtn";
import TableStructure from "../../components/TableStrucute/TableStructure";
import useOpenPage from "../../hooks/useOpenPage";
import { WSContext } from "../../context/WebSocketContext";
import ReferralTree from "../../components/CustomTree/RefferalTree";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import useIsMobileShare from "../../hooks/useMobileDeviceShared";

const qualifications = ["Ассистент", "Агент", "Менеджер", "Партнер", "Управляющий", "Топ-менеджер", "Вице-президент"];

export default function Structure() {
  const containerRef = useRef(null);
  const [activeRadioBtn, setActiveRadioBtn] = useState("Вертикально");
  const { structureVolumes, user } = useContext(WSContext);
  const shareModalRef = useRef(null);
  const isMobileShare = useIsMobileShare();

  const refLink = user
    ? `${import.meta.env.VITE_FRONT_DOMAIN}/main?referrer=${user.referal_link}&user=${user.username}`
    : "";

  useOpenPage("Structure");

  const radioBtns = [
    {
      label: "Графический",
      value: "Вертикально",
    },
    {
      label: "Таблица",
      value: "Таблица",
    },
  ];

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

  const shareLink = () => {
    if (isMobileShare) {
      handleMobileShare();
      return;
    }
    shareModalRef.current.open();
  };

  const isShow = user?.is_agent;

  return (
    <>
      {isShow && (
        <div className={style.overlay}>
          {structureVolumes && (
            <div className={style.volume}>
              <div className={style.volume__item}>
                <h4>Количество партнеров</h4>
                <p>{structureVolumes?.count_users}</p>
              </div>
              <div className={style.volume__item}>
                <h4>Личные акции</h4>
                <p>{structureVolumes?.lo}</p>
              </div>
              <div className={style.volume__item}>
                <h4>Групповой объем акций</h4>
                <p>{structureVolumes?.go}</p>
              </div>
              <div className={style.volume__item}>
                <h4>Личные продажи акций</h4>
                <p>{structureVolumes?.ls}</p>
              </div>
              <div className={style.volume__item}>
                <h4>Квалификация</h4>
                <p>{structureVolumes?.qualification > 0 ? qualifications[structureVolumes?.qualification - 1] : ""}</p>
              </div>
            </div>
          )}
          <div className={style.container} ref={containerRef}>
            <div className={style.controlPanel}>
              <div className={style.title}>
                <h5>Вид структуры</h5>
                <Icon name="info-sign" width="20" />
              </div>
              <div className={style.tabsRefContainer}>
                <div className={style.chooseStructureType}>
                  {radioBtns.map((btn, i) => (
                    <CustomRadioButton
                      key={i}
                      label={btn.label}
                      value={btn.value}
                      checked={activeRadioBtn === btn.value}
                      onChange={val => setActiveRadioBtn(val)}
                    />
                  ))}
                </div>

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

                    <button onClick={shareLink} className={style.reffLink__actionBtn}>
                      <Icon name="share" width={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {activeRadioBtn === "Вертикально" ? (
              // <VerticalStructure reff={containerRef} />
              <ReferralTree />
            ) : (
              <div className={style.tableContainer}>
                <TableStructure />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
