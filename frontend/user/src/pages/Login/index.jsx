import Input from "../../components/Input/Input";
import CustomCheckbox from "../../components/CustomCheckbox/CustomCheckbox";
import Button from "../../components/Button/Button";
import style from "./Login.module.scss";
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { getUserData, login } from "../../api/auth";
import { catchError } from "../../api/catchError";
import { checkEmailVerification } from "../../api/verificationCode";
import Loader from "../../components/Loader/Loader";
import { userContext } from "../../context/userContext";
import { toast } from "react-toastify";

export default function Login() {
  const [_, setUser] = useContext(userContext);
  const [cookies, setCookie, removeCookie] = useCookies(["rememberMe"]);
  const location = useLocation();
  const navigation = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const params = location.state;

  const email = params?.email || cookies?.rememberMe?.mail;
  const password = cookies.rememberMe?.pass;

  const [rememberMe, setRememberMe] = useState(Boolean(cookies?.rememberMe));

  const [mail, setMail] = useState(email ?? "");
  const [pass, setPass] = useState(password ?? "");

  const handleRememberMe = () => {
    if (!rememberMe) {
      setCookie("rememberMe", {
        mail,
        pass,
      });
    } else {
      removeCookie("rememberMe");
    }
    setRememberMe((prev) => !prev);
  };


  const changeMail = (val) => {
    setMail(val);
    setRememberMe((prev) => {
      if(prev) {
        removeCookie("rememberMe");
        return false
      }
      return prev
    });
  }

  const changePass = (val) => {
    setPass(val);
    setRememberMe((prev) => {
      if(prev) {
        removeCookie("rememberMe");
        return false
      }
      return prev
    });
    removeCookie("rememberMe");
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await login({ email: mail, password: pass });
      const user = await getUserData({ access_token: data.access_token });
      setUser(user.result);
      setCookie("access_token", data.access_token, { path: "/" });
      navigation("/main", { replace: true });
      setIsLoading(false);
    } catch (e) {
      if (e?.response?.data?.detail?.error === "User not verified") {
        await sendCode(mail, pass, e.response.data.detail.access_token);
        return;
      }
      toast.error(catchError(e))
      setIsLoading(false);
    }
  };

  const sendCode = async (email, password, client_jwt) => {
    try {
      setIsLoading(true);
      const response = await checkEmailVerification(email);
      if (response.result === "ok") {
        navigation("/email-confirmation", {
          state: {
            email,
            password,
          },
        });
      }
    } catch (e) {
      alert(catchError(e))
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.description}>
       
      </div>
      <form onSubmit={handleLogin} className={style.form}>
        <Input
          value={mail}
          setValue={changeMail}
          label="Email"
          placeholder="Введите e-mail"
          type="email"
          autoComplete="username"
        />
        <Input
          value={pass}
          setValue={changePass}
          label="Пароль"
          placeholder="Введите пароль"
          type="password"
          autoComplete="current-password"
        />
        <div className={style.control}>
          <CustomCheckbox
            label="Запомнить меня"
            checked={rememberMe}
            onChange={handleRememberMe}
          />
          <Link
            className={style.link}
            to="/forgot-password"
            state={{ email: mail }}
          >
            Не помню пароль
          </Link>
        </div>
        <Button disabled={!pass.length || !login.length} type="primary">Войти</Button>
      </form>
      <div className={style.footer}>
        <p>Нет аккаунта?</p>
        <Link className={style.link} to="/sign-up">
          Регистрация
        </Link>
      </div>
      {isLoading && <Loader />}
    </div>
  );
}
