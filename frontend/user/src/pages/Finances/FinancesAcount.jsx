import style from "./Finances.module.scss";
import Button from "../../components/Button/Button";
import Icon from "../../components/Icon/Icon";
import Table from "../../components/Table/Table";
import InfoTabs from "../../components/InfoTabs/InfoTabs";
import { memo, useContext, useEffect, useRef, useState } from "react";
import Tabs from "../../components/Tabs/Tabs";
import { WSContext } from "../../context/WebSocketContext";
import useOpenPage from "../../hooks/useOpenPage";
import ImageLoader from "../../components/ImageLoader/ImageLoader";
import Modal from "../../components/Modal/Modal";
import Loader from "../../components/Loader/Loader";
import { cancelReceipt, getDogovor, sendReceipt } from "../../api/main";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import useWSSend from "../../hooks/useWSSend";
import ReactSlider from "react-slider";
import { requisitesTorus } from "../../../requisitesTorus";
import { requisitesEcliptics } from "../../../requisitesEcliptics";
import jsPDF from "jspdf";
import Jost from "../../assets/fonts/Jost-400.ttf";
import { LoadFileBase64 } from "../../helpers/loadFileAsBase64";
import qrEcliptics from "../../assets/qr/qr_ecliptics.jpg";
import qrTorus from "../../assets/qr/qr_torus.png";
const fontAsBase64 = await LoadFileBase64(Jost);

const dataHeader = ["Ун.№ транзакции", "Описание", "Дата", "Статус", "Сумма, ₽", "Действия"];

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

function Finances() {
  const { transactions, isReady, user } = useContext(WSContext);

  const hash = useRef("");
  const modalRef = useRef(null);
  const filterModalRef = useRef(null);
  const imageLoaderRef = useRef(null);
  const [chequePhoto, setChequePhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [amountValue, setAmountValue] = useState([]);
  const [filterValue, setFilterValue] = useState({
    amount_min: 0,
    amount_max: 0,
  });

  const tabs = [
    {
      link: null,
      title: "Список счетов",
    },
  ];

  if (user?.lo > 0) {
    tabs.push({
      link: "/finances/bonuses",
      title: "Бонусы",
    });
  }

  const [cookies] = useCookies(["access_token"]);
  const token = cookies?.access_token;

  const clearFields = () => {
    setChequePhoto(null);
    imageLoaderRef?.current?.clear();
    hash.current = null;
  };

  const onApprove = tx_hash => {
    hash.current = tx_hash;
    modalRef?.current?.open();
  };

  const onSendReceipt = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("receipt", chequePhoto);
      await sendReceipt(token, hash?.current, formData);
      modalRef?.current?.close(false);
      toast.success("Уже проверяем Вашу оплату");
      clearFields();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onCancelReceipt = async tx_hash => {
    try {
      setIsLoading(true);
      await cancelReceipt(token, tx_hash);
      toast.success("Успешно отменено");
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const [amount, setAmount] = useState({
    min: 0,
    max: 0,
  });

  const sendData = useWSSend();

  useEffect(() => {
    if (transactions) {
      setIsLoading(false);
      setAmount({
        min: transactions.min_amount,
        max: transactions.max_amount,
      });
    }
  }, [transactions]);

  useEffect(() => {
    if (transactions) {
      setFilterValue({
        amount_min: transactions.min_amount,
        amount_max: transactions.max_amount,
      });
    }
  }, [transactions?.amount_max]);

  useEffect(() => {
    if (transactions?.amount_max > 0) getNewData(0);
  }, [filterValue]);

  useOpenPage("Finances", {
    tx_type: 0,
    limit: 10,
    offset: 0,
    filter: "",
  });

  const getNewData = (page = 0, amountMin = filterValue.amount_min, amountMax = filterValue.amount_max) => {
    setIsLoading(true);
    sendData("Finances", {
      tx_type: 0,
      limit: 10,
      offset: page * 10,
      filter: amountMax ? `amount >= ${amountMin} and amount <= ${amountMax}` : "",
    });
  };

  const applyFilter = () => {
    filterModalRef.current.close();

    setFilterValue(prev => ({
      ...prev,
      amount_min: amountValue[0],
      amount_max: amountValue[1],
    }));

    getNewData(0, amountValue[0], amountValue[1]);
  };

  const getDoc = async hash => {
    try {
      setIsLoading(true);
      const data = await getDogovor(token, hash);
      const pdfURL = URL.createObjectURL(data);

      const link = document.createElement("a");
      link.href = pdfURL;
      link.download = `dogovor_${hash}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(pdfURL);
    } catch (e) {
      console.log(e);
      toast.error("Не удалось скачать договор");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePdf = type => {
    if (type !== "torus" && type !== "ecliptics") return;
    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.height;

    doc.addFileToVFS("Jost-400.ttf", fontAsBase64);
    doc.addFont("Jost-400.ttf", "Jost", "normal");
    doc.setFont("Jost", "normal");

    const Y_PAGE_START = 10;

    let x = 10;
    let y = Y_PAGE_START;
    const lineHeight = 10;

    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 10;
    const bodyW = pageW - marginX * 2;
    const qrWidth = 40;
    const qrHeight = 40;
    const qrX = marginX + (bodyW - qrWidth) / 2;
    const qrY = 10;

    doc.addImage(type === "torus" ? qrTorus : qrEcliptics, "PNG", qrX, qrY, qrWidth, qrHeight);
    y += qrHeight;

    if (type === "torus") {
      requisitesTorus.forEach(req => {
        if (y > pageHeight - lineHeight) {
          doc.addPage();
          y = Y_PAGE_START;
        }

        y += lineHeight;

        doc.setFontSize(12);

        doc.text(req.label, x, y);

        y += lineHeight;
        doc.setFontSize(14);
        doc.text(req.text, x, y - 3);
      });
    }

    if (type === "ecliptics") {
      requisitesEcliptics.forEach(req => {
        if (y > pageHeight - lineHeight) {
          doc.addPage();
          y = Y_PAGE_START;
        }

        y += lineHeight;

        doc.setFontSize(12);

        doc.text(req.label, x, y);

        y += lineHeight;
        doc.setFontSize(14);
        doc.text(req.text, x, y - 3);
      });
    }

    doc.save(`requisite-${type}.pdf`);
  };

  return (
    <>
      {((isReady && !transactions) || isLoading) && <Loader />}
      <div className={style.container}>
        <div className={style.header}>
          <Tabs tabs={tabs} />
          <div className={style.buttons}>
            <Button onClick={() => filterModalRef?.current?.open()} type="secondary">
              <Icon name="filter" width={21} />
            </Button>
            <Button type="secondary">
              <Icon name="download" width={21} />
            </Button>
          </div>
        </div>
        <div className={style.financesInfo}>
          <div className={style.infoTabs}>
            <InfoTabs text={["Всего оплаченных счетов:", transactions?.amount_received]} />
            <InfoTabs text={["Счетов в ожидании:", transactions?.in_waiting]} />
            <InfoTabs text={["Отклоненные:", transactions?.rejected]} />
          </div>
        </div>
        <div className={style.table}>
          <h4 className={style.tableTitle}>
            Список счетов
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "10px",
              }}>
              <button onClick={() => generatePdf("torus")}>Скачать реквизиты АО «Торус Групп»</button>
              <button onClick={() => generatePdf("ecliptics")}>Скачать реквизиты АО «Эклиптикс»</button>
            </div>
          </h4>
          <Table
            onChangePage={page => getNewData(page)}
            count={transactions?.count || 0}
            pagination={true}
            totalData={transactions?.transactions || []}
            header={dataHeader}
            rowItem={(item, i) => (
              <tr key={i}>
                <td>{item.tx_hash}</td>
                <td>{transactions.buy_types[item.buy_type]}</td>
                <td>{item.create_at}</td>
                <td>
                  <p className={statuses[item.status].class}>
                    <span></span>
                    {statuses[item.status].title}
                  </p>
                </td>
                <td>{item.amount}</td>
                <td>
                  {item.status === 0 && (
                    <div className={style.rowBtns}>
                      <button className={style.actionBtn} onClick={() => onApprove(item.tx_hash)}>
                        <Icon name="paper-clip" width={20} />
                        Отправить
                      </button>
                      <button className={style.cancelBtn} onClick={() => onCancelReceipt(item.tx_hash)}>
                        Отменить
                      </button>
                    </div>
                  )}
                  {(item.status === 1 || item.status === 3) && (
                    <button onClick={() => getDoc(item.tx_hash)} className={style.actionBtn}>
                      <Icon name="download" width={20} />
                      Скачать
                    </button>
                  )}
                </td>
              </tr>
            )}
          />
        </div>
      </div>
      <Modal modalRef={modalRef}>
        <div className={style.modal}>
          <h5 className={style.modalTitle}>Прикрепите чек оплаты</h5>
          <div className={style.modalContainer}>
            <div className={style.modalImageLoader}>
              <ImageLoader onClear={() => setChequePhoto(null)} loaderRef={imageLoaderRef} setFile={setChequePhoto} />
            </div>
            <Button disabled={!chequePhoto} onClick={onSendReceipt} type="primary">
              Подтвердить оплату
            </Button>
          </div>
        </div>
      </Modal>
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
              onChange={val => setAmountValue(val)}
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
                    className={`${style.slider__track} ${index === 1 ? style.slider__trackBetween : ""}`}
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