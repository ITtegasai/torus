import style from "./Finances.module.scss";
import Button from "../../components/Button/Button";
import Icon from "../../components/Icon/Icon";
import Table from "../../components/Table/Table";
import { memo, useContext, useEffect, useRef, useState } from "react";
import Tabs from "../../components/Tabs/Tabs";
import { WSContext } from "../../context/WebSocketContext";
import useOpenPage from "../../hooks/useOpenPage";
import Modal from "../../components/Modal/Modal";
import Loader from "../../components/Loader/Loader";
import useWSSend from "../../hooks/useWSSend";
import ReactSlider from "react-slider";
import InfoTabs from "../../components/InfoTabs/InfoTabs";
import { withdrawBonuses } from "../../api/main";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

const dataHeader = [
  "Дата",
  "Инициатор",
  "Уровень",
  "Тип",
  "Статус",
  "Сумма, баллы",
];

const statuses = [
  {
    title: "Создана",
    class: style.statusCreated,
  },
  {
    title: "На проверке",
    class: style.statusChecking,
  },
  {
    title: "Отклонена",
    class: style.statusRejected,
  },
  {
    title: "Оплачена",
    class: style.statusPayed,
  },
];

const tabs = [
  {
    link: "/finances",
    title: "Список счетов",
  },
  {
    link: null,
    title: "Бонусы",
  },
];

function Finances() {
  const { bonuses, isReady } = useContext(WSContext);
  const [cookies] = useCookies(["access_token"]);
  const token = cookies?.access_token;
  const [getBonusesBtnloading, setGetBonusesBtnLoading] = useState(false);

  const filterModalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [amountValue, setAmountValue] = useState([]);
  const [filterValue, setFilterValue] = useState({
    amount_min: 0,
    amount_max: 0,
  });

  const [amount, setAmount] = useState({
    min: 0,
    max: 0,
  });

  const sendData = useWSSend();

  useEffect(() => {
    if (bonuses) {
      setIsLoading(false);
      setAmount({
        min: bonuses.min_amount,
        max: bonuses.max_amount,
      });
    }
  }, [bonuses]);

  useEffect(() => {
    if (bonuses) {
      setFilterValue({
        amount_min: bonuses.min_amount,
        amount_max: bonuses.max_amount,
      });
    }
  }, [bonuses?.amount_max]);

  useEffect(() => {
    if (bonuses?.amount_max > 0) getNewData(0);
  }, [filterValue]);

  useOpenPage("Bonuses", {
    tx_type: 0,
    limit: 10,
    offset: 0,
    filter: "",
  });

  const getNewData = (
    page = 0,
    amountMin = filterValue.amount_min,
    amountMax = filterValue.amount_max
  ) => {
    setIsLoading(true);
    sendData("Bonuses", {
      tx_type: 0,
      limit: 10,
      offset: page * 10,
      filter: amountMax
        ? `amount >= ${amountMin} and amount <= ${amountMax}`
        : "",
    });
  };

  const applyFilter = () => {
    filterModalRef.current.close();

    setFilterValue((prev) => ({
      ...prev,
      amount_min: amountValue[0],
      amount_max: amountValue[1],
    }));

    getNewData(0, amountValue[0], amountValue[1]);
  };

  const getBonuses = async () => {
    if (!bonuses?.available_receipt) {
      toast.error("Не удалось вывести бонусы");
      return;
    }
    try {
      setGetBonusesBtnLoading(true);
      const data = await withdrawBonuses(token, 0);
      console.log(data);
      toast.success("Запрос на вывод успешно отправлен");
    } catch (e) {
      console.log(e);
      toast.error("Не удалось вывести бонусы");
    } finally {
      setGetBonusesBtnLoading(false);
    }
  };

  return (
    <>
      {((isReady && !bonuses) || isLoading) && <Loader />}
      <div className={style.container}>
        <div className={style.header}>
          <Tabs tabs={tabs} />
          <div className={style.buttons}>
            <Button
              onClick={() => filterModalRef?.current?.open()}
              type="secondary"
            >
              <Icon name="filter" width={21} />
            </Button>
            <Button type="secondary">
              <Icon name="download" width={21} />
            </Button>
          </div>
        </div>
        <div className={style.financesInfo}>
          <div className={style.infoTabs}>
            <InfoTabs
              text={["Всего начисленных бонусов:", bonuses?.all_bonuses]}
            />
            <InfoTabs text={["Бонусов в ожидании:", bonuses?.in_waiting]} />
            <InfoTabs text={["Отклоненные:", bonuses?.rejected]} />
          </div>
          <div className={style.readyToGet}>
            <div className={style.readyToGet__leftPart}>
              <p className={style.readyToGet__title}>Доступно к получению</p>
              <p className={style.readyToGet__sum}>
                {bonuses?.available_receipt || 0} балл
              </p>
            </div>
            <Button
              disabled={getBonusesBtnloading || !bonuses?.available_receipt}
              onClick={getBonuses}
              variant="secondary"
            >
              Получить
            </Button>
          </div>
        </div>
        <div className={style.table}>
          <h4 className={style.tableTitle}>Список счетов</h4>
          <Table
            onChangePage={(page) => getNewData(page)}
            count={bonuses?.count || 0}
            pagination={true}
            totalData={bonuses?.transactions || []}
            header={dataHeader}
            rowItem={(item, i) => (
              <tr key={i}>
                <td>{item.create_at}</td>
                <td>{item.initiator_id}</td>
                <td>{item.initiator_level}</td>
                <td>{bonuses?.bonus_types[item.bonus_type]}</td>
                <td>
                  <p className={statuses[item.status].class}>
                    <span></span>
                    {statuses[item.status].title}
                  </p>
                </td>
                <td>{item.amount}</td>
              </tr>
            )}
          />
        </div>
      </div>
      <Modal modalRef={filterModalRef} position="right">
        <div className={style.filterModalContainer}>
          <h4 className={style.filterModal__title}>Настройка фильтра</h4>
          {amount.max && (
            <ReactSlider
              className={style.slider}
              thumbClassName={style.slider__thumb}
              trackClassName={style.slider__track}
              defaultValue={[amount.min, amount.max]}
              min={amount.min}
              max={amount.max}
              step={1}
              onChange={(val) => setAmountValue(val)}
              renderThumb={(props, state) => {
                const { key, ...otherProps } = props;
                return (
                  <div key={key} {...otherProps}>
                    <div className={style.slider__label}>{state.valueNow}</div>
                  </div>
                );
              }}
              renderTrack={(props, state) => {
                const index = state.index;
                const { key, ...otherProps } = props;
                return (
                  <div
                    key={key}
                    {...otherProps}
                    className={`${style.slider__track} ${
                      index === 1 ? style.slider__trackBetween : ""
                    }`}
                  />
                );
              }}
            />
          )}
          <div className={style.useFilterBtn}>
            <Button onClick={applyFilter}>Применить</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default memo(Finances);
