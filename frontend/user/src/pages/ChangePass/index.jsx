import React, { useState } from "react";
import style from "./ChangePass.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";
import { setNewPassword } from "../../api/auth";

export default function ChangePass() {
  const navigate = useNavigate();
  const [pass, setPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");

  const location = useLocation();
  const { email, code } = location.state;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSavePass = async (e) => {
    e.preventDefault();
    setError(null);

    if (pass !== repeatPass) {
      setError("Пароли не совпадают");
      return;
    }

    if (pass.length < 8) {
      setError("Пароль слишком короткий");
      return;
    }

    try {
      setLoading(true);
      await setNewPassword({ email, code, password: pass });
      navigate('/login')
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className={style.container}>
        <div className={style.description}>
          Создайте новый пароль для входа в кабинет
        </div>
        <form onSubmit={onSavePass} className={style.form}>
          <Input
            value={pass}
            setValue={setPass}
            label="Введите новый пароль"
            placeholder="Введите пароль"
            autoComplete="new-password"
            type="password"
          />
          <Input
            value={repeatPass}
            setValue={setRepeatPass}
            label="Введите пароль еще раз"
            placeholder="Повторите пароль"
            type="password"
            autoComplete="new-password"
          />
          {error && <p className="error">{error}</p>}
          <p>Пароль должен содержать минимум 8 символов</p>
          <Button
            disabled={pass !== repeatPass || pass.length < 8}
            type="primary"
          >
            Сохранить
          </Button>
        </form>
        <div className={style.footer}>
          <p>Do you have an account ?</p>
          <Link className={style.link} to="/login">
            Log in here
          </Link>
        </div>
      </div>
    </>
  );
}
