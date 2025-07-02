import Table from "../../../components/Table";
import AccountsActions from "./AccountsActions";
import style from "../Accounts.module.scss";
import { useRef, useState } from "react";
import Modal from "../../../components/Modal";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { confirmPurchase } from "../../../api";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader/Loader";

export const txStatuses = [
  {
    title: "Создана",
  },
  {
    title: "На проверке",
  },
  {
    title: "Отклонена",
  },
  {
    title: "Оплачена",
  },
];

export const accountDescription = (fixed, installment) => {
  if (fixed == true) {
    return "рассрочка";
  } else {
    if (installment == true) {
      return "покупка пакета";
    } else {
      return "внесение суммы";
    }
  }
};

export default function AccountsTable({ data, buyTypes }) {
  const modalRef = useRef();
  const [amount, setAmount] = useState();
  const [currentHash, setCurrentHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const confirmOrAcceptPurchase = async (type, hash) => {
    try {
      setIsLoading(true);
      const data = await confirmPurchase(hash || currentHash, type, amount);
      console.log(data);
      toast.success(`Покупка успешно ${type === 3 ? "подтверждена" : "отклонена"}`);
      modalRef.current.close();
      setAmount("");
    } catch (e) {
      toast.error(e.message || e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className={style.table}>
        <Table
          data={data}
          header={[
            "Реквизиты получателя",
            "Логин",
            "Почта",
            "ФИО",
            "Описание",
            "Тип",
            "Дата",
            "Сумма",
            "Статус",
            "Действия",
          ]}
          rowItem={item => (
            <tr key={item.id}>
              <td>{item.tx_hash.slice(0, 10)}...</td>
              <td>{item.username}</td>
              <td>{item.email}</td>
              <td>{item.first_name}</td>
              <td>
                <strong>{buyTypes[item.buy_type]}</strong>
                <p>({accountDescription(item.fixed, item.installment)})</p>
              </td>
              <td>{item.package_id === 1 ? "Торус Групп" : "Эклиптикс"}</td>
              <td>
                <p>{item.create_at.split(" ")[0]}</p>
                <p>{item.create_at.split(" ")[1]}</p>
              </td>
              <td>{item.amount}</td>
              <td>{txStatuses[item.status].title}</td>
              <td>
                <AccountsActions
                  modalRef={modalRef}
                  status={item?.status}
                  tx_hash={item.tx_hash}
                  confirmOrAcceptPerchase={confirmOrAcceptPurchase}
                  setCurrentHash={setCurrentHash}
                />
              </td>
            </tr>
          )}
        />
      </div>
      <Modal modalRef={modalRef}>
        <div className={style.modal__container}>
          <h2>Введите сумму</h2>
          <Input type="number" value={amount} setValue={setAmount} />
          <div className={style.modal__actionBtns}>
            <Button onClick={() => modalRef.current.close()} variant="secondary">
              Отмена
            </Button>
            <Button onClick={() => confirmOrAcceptPurchase(3)} disabled={!amount}>
              Подтвердить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
