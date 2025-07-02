import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import style from "./SignUp.module.scss";
import Input from "../../components/Input/Input";
import { useState } from "react";
import { registration } from "../../api/auth";
import { catchError } from "../../api/catchError";
import Loader from "../../components/Loader/Loader";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { checkEmailVerification } from "../../api/verificationCode";

export default function SignUp() {
  const [login, setLogin] = useState("");
  const [mail, setMail] = useState("");
  const [pass, setPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [cookies] = useCookies(["referrer"]);

  const referrer = cookies?.referrer?.referrer || "";
  const user = cookies?.referrer?.user || "";

  const navigation = useNavigate();

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      if (pass !== repeatPass) {
        throw new Error("Пароли не совпадают");
      }
      if (!validateEmail(mail)) {
        throw new Error("Невалидный email");
      }

      if (!referrer) {
        throw new Error("Регистрация возможна только по приглашению");
      }

      setLoading(true);
      const data = await registration({
        login,
        email: mail,
        password: pass,
        referrer,
      });

      const code = await sendCode(mail, pass);

      if (code.error) {
        throw new Error("Ошибка при отправке кода");
      }

      if (code.result === "ok") {
        navigation("/email-confirmation", {
          state: {
            email: mail,
            password: pass,
          },
          replace: true,
        });
      }
    } catch (e) {
      toast.error(catchError(e));
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async (email, password) => {
    return await checkEmailVerification(email);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const btnActive =
    repeatPass === pass &&
    pass.length &&
    mail.length &&
    login.length &&
    validateEmail(mail);

  return (
    <div className={style.container}>
      <div className={style.description}>
    
      </div>
      {user && <div className={style.referrer}>Вас пригласил(а) {user}</div>}
      <form onSubmit={handleRegistration} className={style.form}>
        <Input
          value={login}
          setValue={setLogin}
          label="Логин"
          placeholder="Введите текст"
          type="text"
          autoComplete="username"
        />
        <Input
          value={mail}
          setValue={setMail}
          label="Email"
          placeholder="Введите Email"
          type="email"
          autoComplete="email"
        />
        <Input
          value={pass}
          setValue={setPass}
          label="Пароль"
          placeholder="Введите текст"
          type="password"
          autoComplete="current-password"
        />
        <Input
          value={repeatPass}
          setValue={setRepeatPass}
          label="Пароль"
          placeholder="Введите текст"
          type="password"
        />
        <Button disabled={!btnActive} type="primary">
          Зарегистрироваться
        </Button>
      </form>
      <div className={style.footer}>
        <p>У вас есть аккаунт?</p>
        <Link className={style.link} to="/login">
          Войти
        </Link>
      </div>
      {isLoading && <Loader />}
    </div>
  );
}
