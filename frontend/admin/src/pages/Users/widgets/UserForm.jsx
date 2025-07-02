import { useState, useEffect } from "react";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import style from "../Users.module.scss";
import Button from "../../../components/Button";
import { toast } from "react-toastify";
import { addShares, getUserVerificationImages, updateUser } from "../../../api";
import Loader from "../../../components/Loader/Loader";

export default function UserInfoForm({ user, modalRef }) {
  console.log("user", user);
  const [emailPrev, setEmailPrev] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingShares, setAddingShares] = useState(false);

  const [sharesAmountTorus, setSharesAmountTorus] = useState(0);
  const [withBonusTorus, setWithBonusTorus] = useState(false);

  const [sharesAmountEcl, setSharesAmountEcl] = useState(0);
  const [withBonusEcl, setWithBonusEcl] = useState(false);

  const downloadDocs = async type => {
    try {
      setIsLoading(true);
      const data = await getUserVerificationImages(type, user.uid);
      if (!data) throw new Error("Изображение отсутствует");

      const { filedata, filename } = data;

      const imageDataUrl = `data:image/jpeg;base64,${filedata}`;

      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${filename || ""}</title></head>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0;">
              <img src="${imageDataUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        const link = document.createElement("a");
        link.href = imageDataUrl;
        link.download = filename || "document.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.log(e.message);
      toast.error(`Ошибка: ${e.message || e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setEmailPrev(user?.email);
    setEmail(user?.email);
  }, [user]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await toast.promise(
        updateUser(user.uid, {
          email,
        }),
        {
          pending: "Сохраняем изменения",
          success: "Изменения сохранены",
          error: "Ошибка сохранения изменений",
        },
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }

    // modalRef?.current.close();
  };

  const cancel = () => {
    modalRef?.current.close();
  };

  const handleAddShares = async (sharesAmount, withBonus, packageId) => {
    setAddingShares(true);
    try {
      await toast.promise(addShares(user.uid, sharesAmount, withBonus, packageId), {
        pending: " ",
        success: "Начисление успешно",
        error: "Ошибка начисления",
      });
      setSharesAmountTorus(0);
      setSharesAmountEcl(0);
    } catch (error) {
      console.log(error);
    } finally {
      setAddingShares(false);
    }
  };

  return (
    <>
      <div className={style.form}>
        <Input disabled setValue={() => {}} value={user?.first_name || ""} placeholder="Введите ФИО" label="ФИО" />
        <Input
          disabled
          setValue={() => {}}
          value={user?.balance.toFixed(2) || ""}
          placeholder="Баланс"
          label="Баланс"
        />
        <Input
          disabled
          setValue={() => {}}
          value={user?.phone || ""}
          placeholder="Введите номер телефона"
          label="Телефон"
        />

        <Input
          disabled
          setValue={() => {}}
          value={user?.birthday?.split(" ")[0] || ""}
          type="date"
          placeholder="Введите дату рождения"
          label="Дата рождения"
        />

        <Input disabled setValue={() => {}} value={user?.city || ""} placeholder="Введите город" label="Город" />

        <Input
          disabled
          setValue={() => {}}
          value={user?.profession || ""}
          placeholder="Введите род деятельности"
          label="Род деятельности"
        />

        <Input
          disabled
          setValue={() => {}}
          value={user?.telegram || ""}
          placeholder="Введите Whatsap/Telegram"
          label="Whatsap/Telegram"
        />

        <Input
          disabled
          setValue={() => {}}
          value={user?.passport_number || ""}
          placeholder="Введите номер и серию паспорта"
          label="Паспортные данные"
        />

        <Input
          disabled
          setValue={() => {}}
          value={user?.passport_date?.split(" ")[0] || ""}
          placeholder="Введите дату выдачи паспорта"
          label="Паспортные данные"
          type="date"
        />

        <Input
          disabled
          setValue={() => {}}
          value={user?.registration || ""}
          placeholder="Введите место жительства"
          label="Место жительства"
        />

        <Input
          disabled
          setValue={() => {}}
          value={user?.education || ""}
          placeholder="Введите образование"
          label="Образование"
        />

        <Input disabled setValue={() => {}} value={user?.username} placeholder="Введите логин" label="Логин" />

        <Input setValue={val => setEmail(val)} value={email || ""} placeholder="Введите e-mail" label="Почта" />

        <div></div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}>
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
            }}>
            Начисление Торус
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "6px",
            }}>
            <Input setValue={val => setSharesAmountTorus(val)} value={sharesAmountTorus} placeholder="" type="number" />
            <Select
              onChange={val => {
                setWithBonusTorus(val);
              }}
              value={withBonusTorus}
              options={[
                { title: "Без начисления болнусов", value: false },
                { title: "С начислением бонусов", value: true },
              ]}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}>
          <Button
            onClick={() => handleAddShares(sharesAmountTorus, withBonusTorus, 1)}
            disabled={isAddingShares || sharesAmountTorus === 0}>
            Начислить
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}>
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
            }}>
            Начисление Эклиптикс
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "6px",
            }}>
            <Input setValue={val => setSharesAmountEcl(val)} value={sharesAmountEcl} placeholder="" type="number" />
            <Select
              onChange={val => {
                setWithBonusEcl(val);
              }}
              value={withBonusEcl}
              options={[
                { title: "Без начисления болнусов", value: false },
                { title: "С начислением бонусов", value: true },
              ]}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}>
          <Button
            onClick={() => handleAddShares(sharesAmountEcl, withBonusEcl, 2)}
            disabled={isAddingShares || sharesAmountEcl === 0}>
            Начислить
          </Button>
        </div>
      </div>
      <div className={style.docsActions}>
        <div></div>
        <button onClick={() => downloadDocs(0)}>Фото паспорта</button>
        <div></div>
        <button onClick={() => downloadDocs(1)}>Фото селфи</button>
      </div>
      <div className={style.formAction}>
        <Button onClick={handleSubmit} disabled={email === emailPrev || isSaving}>
          Сохранить изменения
        </Button>
        <Button onClick={cancel} variant="secondary">
          Отменить
        </Button>
      </div>
      {isLoading && <Loader />}
    </>
  );
}
