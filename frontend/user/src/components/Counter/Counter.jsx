import { useImperativeHandle, useState } from "react";
import style from "./Counter.module.scss";
import Icon from "../Icon/Icon";

export default function Counter({
  label,
  initialValue = 0,
  onChange,
  min = -Infinity,
  max = Infinity,
  countSize = 1000,
  withBtns = true,
  counterRef,
  customStyle,
  grey,
}) {
  const [count, setCount] = useState(initialValue);
  const [error, setError] = useState(null);

  useImperativeHandle(
    counterRef,
    () => ({
      setValue: val => {
        setCount(val);
        validateValue(val);
      },
    }),
    [],
  );

  const validateValue = value => {
    if (value < min) {
      setError(`Значение должно быть не меньше ${min}`);
    } else if (value > max && max !== Infinity) {
      setError(`Значение должно быть не больше ${max}`);
    } else {
      setError(null);
    }
  };

  const increment = () => {
    const newValue = count + countSize;
    if (newValue <= max) {
      setCount(newValue);
      validateValue(newValue);
      if (onChange) onChange(newValue);
    }
  };

  const decrement = () => {
    const newValue = count - countSize;
    if (newValue >= min) {
      setCount(newValue);
      validateValue(newValue);
      if (onChange) onChange(newValue);
    }
  };

  const handleChange = e => {
    const value = parseInt(e.target.value.replace(/\D+/g, "")) || 0;
    setCount(value);
    validateValue(value);
    if (onChange) onChange(value);
  };

  return (
    <div className={style.counter}>
      {label && (
        <label>
          {label}
          {error && <span className={style.errorLabel}>({error})</span>}
        </label>
      )}
      <div className={style.counterContainer} style={{ ...(grey && { backgroundColor: "#F1F1F1" }) }}>
        <input type="text" onChange={handleChange} value={count} className={error ? style.error : ""} />
        {withBtns && (
          <>
            <button onClick={decrement} style={{ ...(grey && { color: "#3d4144" }) }}>
              <Icon width={20} name="minus" />
            </button>
            <button onClick={increment} style={{ ...(grey && { color: "#3d4144" }) }}>
              <Icon width={20} name="plus" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
