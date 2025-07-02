import { useEffect, useRef, useState } from "react";
import Button from "../../components/Button/Button";
import style from "./ChangePassCode.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import { checkValidCode } from "../../api/auth";
import { toast } from "react-toastify";


export default function ChangePassCode() {
  const initialValue = ["", "", "", "", "", ""]
  const [code, setCode] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigate()

  const location = useLocation();
  const { email } = location.state || "";

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

    if(verificationCode.length !== initialValue.length) {
      toast.error('Необходимо ввести код');
      return;
    }

    try{
      setIsLoading(true)
      const data = await checkValidCode({
        email,
        code:verificationCode
      })

      if(data.status === 'ok') {
        navigation('/change-pass', {state: {email, code:verificationCode}})
      }else {
        throw new Error('Неверный код')
      }
     
    }catch(e){
      console.log(e.message);
      toast.error(e.message || 'Неверный код')
      setCode(initialValue)
    }finally{
      setIsLoading(false)
    }
  };

  useEffect(() => {
    inputRefs.current[0].focus();
  }, []);

  return (
    <>
    {isLoading && <Loader/>}
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
        <Link className={style.link} to="/forgot-password" state={{ email }}>
          Назад
        </Link>
      </form>
      {isLoading && <Loader/>}
    </div>
    </>
  );
}
