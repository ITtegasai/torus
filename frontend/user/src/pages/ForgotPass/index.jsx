import React, { useState } from "react";
import style from "./ForgotPass.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { checkEmailVerificationChangePass } from "../../api/verificationCode";
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";

export default function ForgotPass() {
  const navigate = useNavigate();

  const location = useLocation();
  const { email } = location.state || "";
  const pattern = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [mail, setMail] = useState(email);

  const isValid = pattern.test(mail);

  const nextStep = async (e) => {
    e.preventDefault();
    setError(null);

    if (!mail.length || !isValid) {
      setError("Невалидный e-mail");
      return;
    }

    try {
      setLoading(true);
      await checkEmailVerificationChangePass({ email: mail });
      navigate("/change-pass-code", { state: { email: mail } });
    } catch (e) {
      toast.error("Что-то пошло не так! Проверьте правильность e-mail и попробуйте еще раз.", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className={style.container}>
        <div className={style.description}>
         
        </div>
        <form onSubmit={nextStep} className={style.form}>
          <Input
            value={mail}
            setValue={setMail}
            label="Email"
            placeholder="Введите текст"
            type="email"
          />
          {error && <p className="error">{error}</p>}
          <Button disabled={!isValid} type="primary">
            Дальше
          </Button>
        </form>
        <div className={style.footer}>
          <p>Нет аккаунта ?</p>
          <Link className={style.link} to="/login">
            Регистрация
          </Link>
        </div>
      </div>
    </>
  );
}
