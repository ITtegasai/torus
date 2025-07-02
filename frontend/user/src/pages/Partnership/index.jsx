import { useContext, useEffect, useRef, useState } from "react";
import useOpenPage from "../../hooks/useOpenPage";
import Loader from "../../components/Loader/Loader";
import style from "./Partnership.module.scss";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { acceptAgent, getDocs } from "../../api/main";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import { userContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { WSContext } from "../../context/WebSocketContext";

export default function Partnership() {
  useOpenPage("User");

  const navigation = useNavigate();

  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cookie] = useCookies(["access_token"]);
  const [dogovor, setDogovor] = useState("");
  const [user] = useContext(userContext);

  const { user: userWs } = useContext(WSContext);

  const infoModal = useRef();

  const token = cookie.access_token || "";

  const handleAcceptAgent = async () => {
    try {
      setIsLoading(true);
      await acceptAgent(token);
      window.handleAgreement = openModal;
      toast.success("Теперь вы агент компании");
      window.location.reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    infoModal.current.open();
  };

  useEffect(() => {
    fetch("/partnership-page.html")
      .then(response => response.text())
      .then(html => {
        setHtmlContent(html);
      })
      .catch(error => console.error("Error loading HTML:", error));
  }, []);

  useEffect(() => {
    // if (userWs?.lo < 1) {
    //   window.handleAgreement = openModal;
    //   return;
    // }
    if (userWs?.is_agent || userWs?.role === 0) {
      window.handleAgreement = openModal;
      return;
    }
    window.handleAgreement = handleAcceptAgent;
  }, [dogovor, userWs]);

  return (
    <>
      {isLoading && <Loader />}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }}></div>;
      {/* <Modal big={true} modalRef={modalRef}>
        <div className={style.docModal}>
          <div
            className={style.doc}
            dangerouslySetInnerHTML={{ __html: dogovor }}
          ></div>
          <div className={style.actionBtns}>
            <Button onClick={handleAcceptAgent}>Согласен</Button>
            <Button onClick={() => modalRef?.current?.close()} type="outlined">
              Отмена
            </Button>
          </div>
        </div>
      </Modal> */}
      <Modal modalRef={infoModal}>
        {/* {userWs?.lo < 1 && (
          <>
            <div className={style.infoModalTitle}>Необходимо купить 1 акцию</div>
            <div className={style.actionBtns}>
              <Button onClick={() => infoModal.current.close()}>Отлично</Button>
            </div>
          </>
        )} */}

        {/* {userWs?.role === 0 ? (
          <>
            {userWs?.lo > 0 && (
              <>
                <div className={style.infoModalTitle}>Необходимо пройти верификацию</div>
                <Button onClick={() => navigation("/profile/verification")}>Верифицироваться</Button>
              </>
            )}
          </>
        ) : (
          <>
            {userWs?.lo > 0 && (
              <>
                <div className={style.infoModalTitle}>Вы уже являетесь Агентом</div>
                <div className={style.actionBtns}>
                  <Button onClick={() => infoModal.current.close()}>Отлично</Button>
                </div>
              </>
            )}
          </>
        )} */}

        {userWs?.role === 0 ? (
          <>
            {
              <>
                <div className={style.infoModalTitle}>Необходимо пройти верификацию</div>
                <Button onClick={() => navigation("/profile/verification")}>Верифицироваться</Button>
              </>
            }
          </>
        ) : (
          <>
            {
              <>
                <div className={style.infoModalTitle}>Вы уже являетесь Агентом</div>
                <div className={style.actionBtns}>
                  <Button onClick={() => infoModal.current.close()}>Отлично</Button>
                </div>
              </>
            }
          </>
        )}
      </Modal>
    </>
  );
}