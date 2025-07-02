import { useContext, useState, useCallback } from "react";
import HeaderWithAction from "../../components/HeaderWithAction";
import HidingBlock from "../../components/HidingBlock";
import IconedButton from "../../components/IconedButton";
import InfoTag from "../../components/InfoTag";
import style from "./Accounts.module.scss";
import Filter from "../../components/Filter";
import { initialFilterAccountsValue, initialFilterFieldsValue } from "../../../userFilter";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import useOpenPage from "../../hooks/useOpenPage";
import { PageNames, WSContext } from "../../context/WebSocketContext";
import Loader from "../../components/Loader/Loader";
import AccountsTable from "./widgets/AccountsTable";
import { downloadExcel, constructName } from "../../helpers/helpers";
import { txStatuses, accountDescription } from "./widgets/AccountsTable";

const PAGE_NAME = PageNames.Invoices;

export default function Accounts({ title }) {
  const { transactions, loadingState } = useContext(WSContext);
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useOpenPage(
    PAGE_NAME,
    {
      tx_type: 0,
      limit,
      offset: limit * (currentPage - 1),
      filter,
    },
    [limit, filter, currentPage],
  );

  const handlePageChange = useCallback(newOffset => {
    setCurrentPage(newOffset);
  }, []);

  const handleLimitChange = useCallback(newLimit => {
    setLimit(newLimit);
  }, []);

  const downloadExcelHandler = (transactions, buy_types) => {
    const cleanedTransactions = transactions.map(transaction => ({
      tx_hash: transaction.tx_hash + "",
      username: transaction.username + "",
      email: transaction.email + "",
      name: constructName(transaction.first_name, transaction.middle_name, transaction.last_name),

      buyType: buy_types[transaction.buy_type] + ` (${accountDescription(transaction.fixed, transaction.installment)})`,
      type: transaction.package_id === 1 ? "Торус Групп" : "Эклиптикс",
      date: transaction.create_at,
      amount: transaction.amount,
      status: txStatuses[transaction.status].title,
    }));

    const customHeaders = ["txHash", "Логин", "Email", "ФИО", "Тип", "Пакет", "Дата", "Сумма", "Статус"];

    downloadExcel(cleanedTransactions, "transactions-report", customHeaders);
  };

  return (
    <>
      {isLoading || (loadingState[PAGE_NAME] && <Loader />)}
      <HeaderWithAction title={title}>
        <IconedButton
          text="Выгрузить таблицу"
          icon="download"
          iconSize={[12, 12]}
          onClick={() => downloadExcelHandler(transactions.transactions, transactions.buy_types)}
        />
      </HeaderWithAction>
      <div className={style.tags}>
        <InfoTag name="Всего счетов" info={transactions?.alls || 0} />
        <InfoTag name="Оплаченных счетов (cумма)" info={transactions?.pay || 0} />
      </div>
      <HidingBlock header="Настройки фильтра">
        <Filter pageName={PAGE_NAME} initialFilterFieldsValue={initialFilterAccountsValue} setFilter={setFilter} />
      </HidingBlock>
      <div className={style.search}>
        <Search />
      </div>
      <AccountsTable data={transactions?.transactions || []} buyTypes={transactions?.buy_types} />
      <div className={style.pagination}>
        <Pagination
          onChangePage={handlePageChange}
          onChangePerCount={handleLimitChange}
          count={transactions?.count || 0}
        />
      </div>
    </>
  );
}
