import { useRef, useState } from "react";
import Counter from "../Counter/Counter";
import style from "./BuyStocksBlock.module.scss";
import Button from "../Button/Button";
import CustomCheckbox from "../CustomCheckbox/CustomCheckbox";
import classNames from "classnames";

export default function BuyStocksBlock({
  clx = "",
  title,
  bgSrc,
  smallTitle,
  label,
  buttonLabel = "Оплатить",
  min = 0,
  max = Infinity,
  onClick,
  isAgreement = true,
  backgroundColor,
  green,
}) {
  const counterRef = useRef(null);
  const [isAgree, setAgree] = useState(false);
  const [summ, setSumm] = useState(min);

  return (
    <div className={classNames(style.stocksPerchase, clx)}>
      <div
        className={style.stocksPerchaseHeader}
        style={{
          ...(backgroundColor && {
            backgroundImage: "none",
            backgroundColor,
          }),
        }}>
        <h5>{title}</h5>
        <img
          src={bgSrc}
          className={style.stocksPerchaseHeaderImage}
          style={{
            ...(backgroundColor && {
              right: 0,
            }),
          }}
        />
      </div>
      <div className={style.stocksPerchaseContent}>
        <div className={style.stocksPerchaseTitle}>{smallTitle}</div>
        <div className={style.stocksPerchaseActions}>
          <Counter
            onChange={val => setSumm(val)}
            label={label}
            min={min}
            initialValue={min}
            counterRef={counterRef}
            countSize={1}
            max={max}
            grey
          />
          <Button
            onClick={() => onClick(summ, 0)}
            disabled={isAgreement && (!isAgree || !summ || summ < min || summ > max)}
            type="primary"
            style={{
              ...(green && { backgroundColor: "#42E39F" }),
            }}>
            {buttonLabel}
          </Button>
        </div>
        {isAgreement && (
          <CustomCheckbox
            checked={isAgree}
            onChange={() => setAgree(prev => !prev)}
            label="Я согласен с условиями пользовательского соглашения"
            grey
          />
        )}
      </div>
    </div>
  );
}
