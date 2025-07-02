import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Tabs from "../../components/Tabs/Tabs";
import style from "./Profile.module.scss";
import Icon from "../../components/Icon/Icon";
import classNames from "classnames";
import ImageLoader from "../../components/ImageLoader/ImageLoader";
import Button from "../../components/Button/Button";
import { WSContext } from "../../context/WebSocketContext";
import { getVirificationImages, uploadVirificationImages } from "../../api/main";
import { useCookies } from "react-cookie";
import useOpenPage from "../../hooks/useOpenPage";
import Loader from "../../components/Loader/Loader";
import { DataURIToBlob } from "../../helpers/dataURIToBlob";
import { toast } from "react-toastify";
import { isCompletedRequired } from "../../helpers/checkRequiredFields";
import requiredFields from "../../../requiredFields";
import Modal from "../../components/Modal/Modal";
import { useNavigate } from "react-router-dom";

const tabs = [
  {
    link: "/profile",
    title: "Личные данные",
  },
  {
    link: null,
    title: "Верификация",
  },
];

const verificationStatusData = [
  {
    title: "Верификация в статусе обработки",
    icon: "reload",
    class: style.verificationStatusPending,
  },
  {
    title: "Верификация успешно пройдена",
    icon: "file-done",
    class: style.verificationStatusDone,
  },
  {
    title: "Верификация успешно пройдена",
    icon: "file-done",
    class: style.verificationStatusDone,
  },
  {
    title: "Верификация успешно пройдена",
    icon: "file-done",
    class: style.verificationStatusDone,
  },
];

export default function ProfileVerification() {
  const { user } = useContext(WSContext);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [passportPreview, setPassportPreview] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanged, setChanged] = useState(false);
  const [cookies] = useCookies(["access_token"]);
  const navigate = useNavigate();

  const modalRef = useRef(null);

  const token = cookies?.access_token;

  useEffect(() => {
    if (user && !isCompletedRequired(user, requiredFields)) {
      modalRef.current.open();
      return;
    }
  }, [user]);

  const uploadImage = useCallback(async () => {
    if (!user) {
      throw new Error("Отсутствует соединение");
    }

    if (!isCompletedRequired(user, requiredFields)) {
      toast.error("Обязательные поля не заполнены");
      navigate("/profile");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("passport", passportPhoto);
      formData.append("selfie", selfiePhoto);
      await uploadVirificationImages(token, formData);
      setChanged(false);
      toast.success("Уже проверяем ваши данные");
    } catch (e) {
      console.log(e.message);
      toast.error("Ошибка", e.message || e);
    } finally {
      setIsLoading(false);
    }
  }, [passportPhoto, selfiePhoto, token]);

  const getImages = useCallback(async () => {
    try {
      setPhotoLoading(true);
      const data = await getVirificationImages(token);
      if (!data) return;
      setPassportPreview(`data:image/jpeg;base64,${data[0].filedata}`);
      setPassportPhoto(DataURIToBlob(`data:image/jpeg;base64,${data[0].filedata}`));
      setSelfiePhoto(DataURIToBlob(`data:image/jpeg;base64,${data[1].filedata}`));
      setSelfiePreview(`data:image/jpeg;base64,${data[1].filedata}`);
    } catch (e) {
      console.log(e);
      return null;
    } finally {
      setPhotoLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      getImages();
    }
  }, [token]);

  useOpenPage(null);

  const changePassport = img => {
    setPassportPhoto(img);
    setChanged(true);
  };

  const changeSelfie = img => {
    setSelfiePhoto(img);
    setChanged(true);
  };

  const btnDisabeld = !selfiePhoto || !passportPhoto || user?.role > 0 || !hasChanged;

  const isPhotoLoaded = passportPreview && selfiePreview;

  const verificationStatus =
    user && user.role > 0 && isPhotoLoaded ? 1 : isPhotoLoaded && user && user.role === 0 ? 0 : null;

  const currentVerificationStatus = verificationStatusData[verificationStatus ? verificationStatus : 0];

  return (
    <>
      {isLoading && <Loader />}
      <div className={style.container}>
        <div className={style.headerVerification}>
          <Tabs tabs={tabs} />
          {user && isPhotoLoaded && verificationStatus !== null && (
            <div className={classNames(style.verificationStatus, currentVerificationStatus.class)}>
              <p>{currentVerificationStatus.title}</p>
              <Icon width={24} name={currentVerificationStatus.icon} />
            </div>
          )}
        </div>
        <div className={style.verificationForm}>
          <div className={style.verificationFormStep}>
            <h4 className={style.verificationStepTitle}>Шаг 1</h4>
            <p className={style.verificationStepDescr}>Загрузка фотографии паспорта</p>
            <ImageLoader isLoading={photoLoading} imgUrl={passportPreview} setFile={changePassport} />
          </div>

          <div className={style.verificationFormStep}>
            <h4 className={style.verificationStepTitle}>Шаг 2</h4>
            <p className={style.verificationStepDescr}>Загрузка фотографии селфи с паспортом</p>
            <ImageLoader isLoading={photoLoading} imgUrl={selfiePreview} setFile={changeSelfie} />
          </div>
        </div>
        <div className={style.endBtn}>
          <Button onClick={uploadImage} disabled={btnDisabeld}>
            Пройти верификацию
          </Button>
        </div>
      </div>
      <Modal modalRef={modalRef}>
        <div className={style.needVerification}>
          <h5 className={style.needVerification__title}>Заполните обязательные поля</h5>
          <p className={style.needVerification__descr}>
            Перед отправкой документов на верификацию, необходимо заполнить обязательные поля Профиля
          </p>
          <Button onClick={() => navigate("/profile")}>Заполнить</Button>
          <Button onClick={() => modalRef?.current?.close()} type="outlined">
            Отмена
          </Button>
        </div>
      </Modal>
    </>
  );
}
