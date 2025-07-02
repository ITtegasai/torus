import { useState, useEffect } from "react";
import Input from "../../../components/Input";
import style from "../Bonuses.module.scss";
import Button from "../../../components/Button";

export default function BonusesInfoForm({ user, modalRef }) {
  const [initialData, setInitialData] = useState({});
  const [data, setData] = useState({
    first_name: "",
    phone: "",
    birthday: "",
    city: "",
    profession: "",
    telegram: "",
    education: "",
    registration: "",
    passport_number: "",
    passport_date: "",
    username: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setData({
        first_name: user.first_name || "",
        phone: user.phone || "",
        birthday: user.birthday || "",
        city: user.city || "",
        profession: user.profession || "",
        telegram: user.telegram || "",
        passport_date: user.passport_date || "",
        passport_number: user.passport_number || "",
        registration: user.registration || "",
        education: user.education || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const newUserData = {
        first_name: user.first_name || "",
        phone: user.phone || "",
        birthday: user.birthday || "",
        city: user.city || "",
        profession: user.profession || "",
        telegram: user.telegram || "",
        passport_date: user.passport_date || "",
        passport_number: user.passport_number || "",
        registration: user.registration || "",
        education: user.education || "",
        username: user.username || "",
        email: user.email || "",
      };
      setData(newUserData);
      setInitialData(newUserData);
    }
  }, [user]);

  const changeField = (val, fieldName) => {
    setData(prev => ({ ...prev, [fieldName]: val }));
  };

  const hasChanges = () => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  };

  const handleSubmit = () => {
    console.log("Submitted data:", data);
    modalRef?.current.close();
  };

  const cancel = () => {
    modalRef?.current.close();
  };

  return (
    <>
      <div className={style.form}>
        <Input
          setValue={val => changeField(val, "first_name")}
          value={data.first_name}
          placeholder="Введите ФИО"
          label="ФИО"
        />
        <Input
          setValue={val => changeField(val, "phone")}
          value={data.phone}
          placeholder="Введите номер телефона"
          label="Телефон"
        />

        <Input
          setValue={val => changeField(val, "birthday")}
          value={data.birthday}
          type="date"
          placeholder="Введите дату рождения"
          label="Дата рождения"
        />

        <Input setValue={val => changeField(val, "city")} value={data.city} placeholder="Введите город" label="Город" />

        <Input
          setValue={val => changeField(val, "profession")}
          value={data.profession}
          placeholder="Введите род деятельности"
          label="Род деятельности"
        />

        <Input
          setValue={val => changeField(val, "telegram")}
          value={data.telegram}
          placeholder="Введите Whatsap/Telegram"
          label="Whatsap/Telegram"
        />

        <Input
          setValue={val => changeField(val, "passport_number")}
          value={data.passport_number}
          placeholder="Введите номер и серию паспорта"
          label="Паспортные данные"
        />

        <Input
          setValue={val => changeField(val, "passport_date")}
          value={data.passport_date}
          placeholder="Введите дату выдачи паспорта"
          label="Паспортные данные"
          type="date"
        />

        <Input
          setValue={val => changeField(val, "registration")}
          value={data.registration}
          placeholder="Введите место жительства"
          label="Место жительства"
        />

        <Input
          setValue={val => changeField(val, "education")}
          value={data.education}
          placeholder="Введите образование"
          label="Образование"
        />

        <Input
          setValue={val => changeField(val, "username")}
          value={data.username}
          placeholder="Введите логин"
          label="Логин"
        />

        <Input
          setValue={val => changeField(val, "email")}
          value={data.email}
          placeholder="Введите e-mail"
          label="Почта"
        />
      </div>
      <div className={style.formAction}>
        <Button onClick={handleSubmit} disabled={!hasChanges()}>
          Сохранить изменения
        </Button>
        <Button onClick={cancel} variant="secondary">
          Отменить
        </Button>
      </div>
    </>
  );
}
