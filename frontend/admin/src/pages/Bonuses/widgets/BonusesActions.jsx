import { useState } from "react";
import Icon from "../../../components/Icon";
import style from "../Bonuses.module.scss";
import classNames from "classnames";
import { withdrawBonuses } from "../../../api";
import { toast } from "react-toastify";

const btnsType = {
  success: 3,
  cancel: 2,
};

export default function BonusesActions({ status, tx_hash, type }) {
  const [isBtnsLoading, setBtnsLoading] = useState(false);

  const withdrawBonus = async status => {
    if (type !== 6) {
      toast.error(`Не удалось ${btnsType.success === status ? "подтвердить" : "отменить"} вывод бонусов`);
    }
    try {
      setBtnsLoading(true);
      await withdrawBonuses(tx_hash, status);
      toast.success(`Вывод бонусов успешно ${btnsType.success === status ? "подтвержден" : "отменен"}`);
    } catch (e) {
      toast.error(`Не удалось ${btnsType.success === status ? "подтвердить" : "отменить"} вывод бонусов`);
      console.log(e);
    } finally {
      setBtnsLoading(false);
    }
  };

  const isBtnDisabled = bonusStatus => {
    return isBtnsLoading || type !== 6 || status === bonusStatus;
  };

  return (
    <>
      <div className={style.actions}>
        <button
          disabled={isBtnDisabled(3)}
          onClick={() => withdrawBonus(btnsType.success)}
          className={classNames(style.acceptBtn, {
            [style.acceptBtn_active]: true,
          })}>
          <Icon name="done" width={24} />
        </button>
        <button
          disabled={isBtnDisabled(2)}
          onClick={() => withdrawBonus(btnsType.cancel)}
          className={classNames(style.crossBtn, {
            [style.crossBtn_active]: true,
          })}>
          <Icon name="cross" width={24} />
        </button>
      </div>
    </>
  );
}
