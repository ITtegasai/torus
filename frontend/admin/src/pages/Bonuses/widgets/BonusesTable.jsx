import Table from "../../../components/Table";
import BonusesActions from "./BonusesActions";
import style from "../Bonuses.module.scss";

export const bonusStatuses = [
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

export default function BonusesTable({ data, bonusesTypes }) {
  return (
    <div className={style.table}>
      <Table
        data={data}
        header={[
          "Реквизиты получателя",
          "Логин получателя",
          "ФИО",
          "Логин инициатора",
          "Бонус",
          "Дата",
          "Сумма",
          "Статус",
          "Действия",
        ]}
        rowItem={item => (
          <tr key={item.id}>
            <td>{item.tx_hash.slice(0, 10)}...</td>
            <td>{item.username}</td>
            <td>{item.first_name}</td>
            <td>{item.initiator_id}</td>
            <td>{bonusesTypes[item?.bonus_type]}</td>
            <td>
              <p>{item.create_at.split(" ")[0]}</p>
              <p>{item.create_at.split(" ")[1]}</p>
            </td>
            <td>{item.amount}</td>
            <td>{item.type === 6 && item.status === 0 ? "Ожидает" : bonusStatuses[item.status].title}</td>
            <td>
              <BonusesActions tx_hash={item.tx_hash} type={item.type} status={item.status} />
            </td>
          </tr>
        )}
      />
    </div>
  );
}
