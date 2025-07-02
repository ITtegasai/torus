import { useContext, useEffect, useRef, useState } from "react";
import Button from "../../components/Button/Button";
import style from "./VerificationEmail.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUserData, verification } from "../../api/auth";
import Loader from "../../components/Loader/Loader";
import { userContext } from "../../context/userContext";
import { useCookies } from "react-cookie";

export default function VerificationEmail() {
  const [user, setUser] = useContext(userContext);
  const [__, setCookie, _] = useCookies();
  const initialValue = ["", "", "", "", "", ""];
  const [code, setCode] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigate();

  const location = useLocation();
  const { email, password } = location.state || "";

  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const { value } = e.target;

    if (isNaN(value)) return;

    const newCode = [...code];
    newCode[index] = value;

    setCode(newCode);

    if (value && index < code.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      setIsLoading(true);
      const response = await verification({
        email,
        password,
        code: verificationCode,
      });
      const user = await getUserData({ access_token: response.access_token });
      setUser(user.result);
      setCookie("access_token", response.access_token, { path: "/" });

      navigation("/main", { replace: true });
    } catch (e) {
      console.log(e);
      setCode(initialValue);
      inputRefs.current[0].focus();
      alert("Неверный код");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0].focus();
  }, []);

  return (
    <div className={style.container}>
      <div className={style.description}>
        На вашу почту {email} отправлен код подтверждения
      </div>
      <form onSubmit={handleSubmit} className={style.form}>
        <label className={style.label}>Код подтверждения</label>
        <div className={style.inputs}>
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              className={style.input}
            />
          ))}
        </div>
        <Button type="primary">Подтвердить</Button>
        <Link className={style.link} to="/login" state={{ email }}>
          Назад
        </Link>
      </form>
      {isLoading && <Loader />}
    </div>
  );
}
