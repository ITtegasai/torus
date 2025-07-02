import { useContext, useState, useCallback } from "react";
import HeaderWithAction from "../../components/HeaderWithAction";
import HidingBlock from "../../components/HidingBlock";
import IconedButton from "../../components/IconedButton";
import InfoTag from "../../components/InfoTag";
import style from "./Bonuses.module.scss";
import Filter from "../../components/Filter";
import { initialFilterBonusesValue } from "../../../userFilter";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import useOpenPage from "../../hooks/useOpenPage";
import { PageNames, WSContext } from "../../context/WebSocketContext";
import { useCookies } from "react-cookie";
import Loader from "../../components/Loader/Loader";
import BonusesTable from "./widgets/BonusesTable";
import { downloadExcel, constructName } from "../../helpers/helpers";
import { bonusStatuses } from "./widgets/BonusesTable";

const PAGE_NAME = PageNames.Invoices;

export default function Bonuses({ title }) {
  const { bonuses, loadingState } = useContext(WSContext);
  const [cookie] = useCookies(["token"]);
  const token = cookie.token || null;
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("");
  console.log(PAGE_NAME);

  useOpenPage(
    PAGE_NAME,
    {
      tx_type: 1,
      limit,
      offset: limit * (currentPage - 1),
      filter,
    },
    [limit, currentPage, filter],
  );

  const handlePageChange = useCallback(newOffset => {
    setCurrentPage(newOffset);
  }, []);

  const handleLimitChange = useCallback(newLimit => {
    setLimit(newLimit);
  }, []);

  const downloadExcelHandler = (bonuses, bonusesTypes) => {
    const cleanedTransactions = bonuses.map(bonus => ({
      tx_hash: bonus.tx_hash + "",
      username: bonus.username + "",
      email: bonus.email + "",
      name: constructName(bonus.first_name, bonus.middle_name, bonus.last_name),
      initiatorLogin: bonus.initiator_id + "",
      type: bonusesTypes[bonus?.bonus_type],
      date: bonus.create_at,
      amount: bonus.amount,
      status: bonusStatuses[bonus.status].title,
    }));

    const customHeaders = ["txHash", "Логин", "Email", "ФИО", "Логин инициатора", "Бонус", "Дата", "Сумма", "Статус"];

    downloadExcel(cleanedTransactions, "bonuses-report", customHeaders);
  };

  return (
    <>
      {isLoading || (loadingState[PAGE_NAME] && <Loader />)}
      <HeaderWithAction title={title}>
        <IconedButton
          text="Выгрузить таблицу"
          icon="download"
          iconSize={[12, 12]}
          onClick={() => downloadExcelHandler(bonuses.transactions, bonuses?.bonus_types)}
        />
      </HeaderWithAction>
      <div className={style.tags}>
        <InfoTag name="Всего бонусов" info={bonuses?.alls || 0} />
        <InfoTag name="Бонусов в ожидании" info={bonuses?.wait || 0} />
        <InfoTag name="Выплаченных бонусов" info={bonuses?.pay || 0} />
      </div>
      <HidingBlock header="Настройки фильтра">
        <Filter pageName={PAGE_NAME} initialFilterFieldsValue={initialFilterBonusesValue} setFilter={setFilter} />
      </HidingBlock>
      <div className={style.search}>
        <Search onChange={setFilter} />
      </div>
      <BonusesTable data={bonuses?.transactions || []} bonusesTypes={bonuses?.bonus_types} />
      <div className={style.pagination}>
        <Pagination onChangePage={handlePageChange} onChangePerCount={handleLimitChange} count={bonuses?.count || 0} />
      </div>
    </>
  );
}
