import { useContext, useRef, useState, useCallback } from "react";
import HeaderWithAction from "../../components/HeaderWithAction";
import HidingBlock from "../../components/HidingBlock";
import IconedButton from "../../components/IconedButton";
import InfoTag from "../../components/InfoTag";
import style from "./Users.module.scss";
import Filter from "../../components/Filter";
import { initialFilterFieldsValue } from "../../../userFilter";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import useOpenPage from "../../hooks/useOpenPage";
import { PageNames, WSContext } from "../../context/WebSocketContext";
import { toast } from "react-toastify";
import { acceptVerification } from "../../api";
import UserTable from "./widgets/UserTable";
import UserModal from "./widgets/UserModal";
import Loader from "../../components/Loader/Loader";
import { downloadExcel, constructName } from "../../helpers/helpers";

const PAGE_NAME = PageNames.Users;

export default function Users({ title }) {
  const { users, loadingState } = useContext(WSContext);
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useOpenPage(
    PAGE_NAME,
    {
      filter,
      tx_type: 0,
      limit,
      offset: limit * (currentPage - 1),
    },
    [limit, filter, currentPage],
  );

  const userInfoModalRef = useRef(null);

  const handlePageChange = useCallback(newOffset => {
    setCurrentPage(newOffset);
  }, []);

  const handleLimitChange = useCallback(newLimit => {
    setLimit(newLimit);
  }, []);

  const openUserModal = user => {
    setCurrentUser(user);
    userInfoModalRef.current.open();
  };

  const acceptUserVerification = async uid => {
    try {
      setIsLoading(true);
      await acceptVerification(uid);
      toast.success("Пользователь успешно верифицирован");
    } catch (e) {
      toast.error(e?.message || "Ошибка запроса");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExcelHandler = users => {
    const cleanedUsers = users.map(user => ({
      id: user.id + "",
      username: user.username,
      name: constructName(user.first_name, user.middle_name, user.last_name),
      role: user.role + "",
      email: user.email,
      phone: user.phone,
      regDate: new Date(parseInt(user.reg_date + "000")).toLocaleDateString("ru-RU") + "",
      qualification: user.qualification + "",
      status: user.status + "",
      lo: user.lo + "",
      go: user.go + "",
      refferLogin: user.reffer_login,
    }));

    const customHeaders = [
      "ID",
      "Логин",
      "ФИО",
      "Роль",
      "Email",
      "Телефон",
      "Дата регистрации",
      "Квалификация",
      "Статус",
      "Личный обьем",
      "Групповой обьем",
      "Логин наставника",
    ];

    downloadExcel(cleanedUsers, "users-report", customHeaders);
  };

  return (
    <>
      {isLoading || (loadingState[PageNames.Users] && <Loader />)}
      <HeaderWithAction title={title}>
        <IconedButton
          text="Выгрузить таблицу"
          icon="download"
          iconSize={[12, 12]}
          onClick={() => downloadExcelHandler(users.users)}
        />
      </HeaderWithAction>
      <div className={style.tags}>
        <InfoTag name="Всего пользователей" info={users?.count || 0} />
      </div>
      <HidingBlock header="Настройки фильтра">
        <Filter pageName={PAGE_NAME} initialFilterFieldsValue={initialFilterFieldsValue} setFilter={setFilter} />
      </HidingBlock>
      <div className={style.search}>
        <Search />
      </div>
      <UserTable
        users={users?.users || []}
        openUserModal={openUserModal}
        acceptUserVerification={acceptUserVerification}
      />
      <div className={style.pagination}>
        <Pagination onChangePage={handlePageChange} onChangePerCount={handleLimitChange} count={users.count || 0} />
      </div>
      <UserModal modalRef={userInfoModalRef} user={currentUser} onClose={() => setCurrentUser(null)} />
    </>
  );
}
