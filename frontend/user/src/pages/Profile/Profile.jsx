import { useContext } from "react";
import Tabs from "../../components/Tabs/Tabs";
import VerificationNotification from "../../components/VerificationNotification/VerificationNotification";
import style from "./Profile.module.scss";
import classNames from "classnames";
import Input from "../../components/Input/Input";
import ImageLoader from "../../components/ImageLoader/ImageLoader";
import Button from "../../components/Button/Button";
import Loader from "../../components/Loader/Loader";
import { useProfile } from "./useProfile";

const tabs = [
  {
    link: null,
    title: "Личные данные",
  },
  {
    link: "/profile/verification",
    title: "Верификация",
  },
];

export default function Profile() {
  const { visible, setVisible, isLoading, formData, onSave, changePhoto, changeField, userPhoto, hasChanged, user } =
    useProfile();

  return (
    <>
      {isLoading && <Loader />}
      <div className={classNames(style.container, { [style.container__noGap]: user && user.role > 0 })}>
        <div
          className={classNames(style.header, {
            [style.verificationClosed]: !visible,
            [style.notVerificatedHeader]: user && user.role,
          })}>
          <Tabs tabs={tabs} />
          {user && user.role < 1 && (
            <div className={style.verification}>
              <VerificationNotification isVisible={visible} setVisible={setVisible} />
            </div>
          )}
        </div>
        <div className={style.main}>
          <div className={style.info}>
            <h4 className={style.title}>Основная информация</h4>
            <div className={style.infoFields}>
              <p className={style.infoFieldsLabel}>
                ФИО<span>*</span>
              </p>
              <Input
                setValue={val => changeField(val, "first_name")}
                value={formData.first_name}
                require
                placeholder="Введите ФИО"
              />

              <p className={style.infoFieldsLabel}>
                Логин<span>*</span>
              </p>
              <Input
                disabled
                isLocked={true}
                setValue={() => {}}
                value={formData.username}
                require
                placeholder="Введите логин"
              />

              <p className={style.infoFieldsLabel}>
                День рождения<span>*</span>
              </p>
              <Input
                setValue={val => changeField(val, "birthday")}
                value={formData.birthday}
                require
                type="date"
                placeholder="Выберите дату"
              />

              <p className={style.infoFieldsLabel}>
                Город проживания<span>*</span>
              </p>
              <Input
                setValue={val => changeField(val, "city")}
                value={formData.city}
                require
                placeholder="Введите город проживания"
              />

              <p className={style.infoFieldsLabel}>Род деятельности</p>
              <Input
                setValue={val => changeField(val, "profession")}
                value={formData.profession}
                placeholder="Введите род деятельности"
              />

              <p className={style.infoFieldsLabel}>Образование</p>
              <Input
                setValue={val => changeField(val, "education")}
                value={formData.education}
                placeholder="Введите образование"
              />

              <p className={style.infoFieldsLabel}>
                № паспорта<span>*</span>
              </p>
              <Input
                setValue={val => changeField(val, "passport_number")}
                value={formData.passport_number}
                require
                placeholder="№"
              />
              <p className={style.infoFieldsLabel}>
                Дата выдачи<span>*</span>
              </p>
              <Input
                require
                setValue={val => changeField(val, "passport_date")}
                value={formData.passport_date}
                type="date"
                placeholder="Выберите дату"
              />

              <p className={style.infoFieldsLabel}>
                Прописка<span>*</span>
              </p>
              <Input
                setValue={val => changeField(val, "registration")}
                value={formData.registration}
                require
                placeholder="Введите адрес прописки"
              />
            </div>
          </div>
          <div className={style.info}>
            <h4 className={style.title}>Фотография</h4>
            <ImageLoader setFile={changePhoto} imgUrl={userPhoto} />
          </div>
          <div>
            <h4 className={style.title}>Контакты</h4>
            <div className={style.infoFields}>
              <p className={style.infoFieldsLabel}>Email</p>
              <Input value={formData.email} disabled isLocked={true} placeholder="Введите Email" />

              <p className={style.infoFieldsLabel}>
                Телефон<span>*</span>
              </p>
              <Input
                require
                type="tel"
                value={formData.phone}
                setValue={val => changeField(val, "phone")}
                placeholder="Введите телефон"
              />

              <p className={style.infoFieldsLabel}>
                Whatsapp/Telegram<span>*</span>
              </p>
              <Input
                setValue={val => changeField(val, "telegram")}
                value={formData.telegram}
                require
                placeholder="Введите Whatsapp/Telegram"
              />
            </div>
          </div>
        </div>
        <div className={style.endBtn}>
          <Button disabled={!hasChanged} onClick={onSave}>
            Сохранить
          </Button>
        </div>
      </div>
    </>
  );
}
