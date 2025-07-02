import Table from "../../../components/Table";
import UserActions from "./UserActions";
import style from "../Users.module.scss";
import dayjs from "dayjs";

export default function UserTable({ users, openUserModal, acceptUserVerification }) {
  return (
    <div className={style.table}>
      <Table
        data={users}
        header={[
          "#",
          "Логин пользователя/Роль",
          "Email/Телефон",
          "ФИО",
          "Дата регистрации",
          "Квалификация",
          "Статус",
          "Личный обьем",
          "Групповой обьем",
          "Логин настаника",
          "Действия",
        ]}
        rowItem={user => (
          <tr key={user.uid}>
            <td>{user.user_id}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{user.first_name}</td>
            <td>{dayjs(user.reg_date * 1000).format("DD.MM.YYYY")}</td>
            <td>{user.qualification}</td>
            <td>{user.status}</td>
            <td>{user.lo}</td>
            <td>{user.go}</td>
            <td>{user.reffer_login}</td>
            <td>
              <UserActions user={user} openUserModal={openUserModal} acceptUserVerification={acceptUserVerification} />
            </td>
          </tr>
        )}
      />
    </div>
  );
}
