import { useContext, useRef, useState } from "react";
import style from "./style.module.scss";
import Icon from "../../components/Icon/Icon";
import Button from "../../components/Button/Button";
import useOpenPage from "../../hooks/useOpenPage";
import Modal from "../../components/Modal/Modal";
import CopyField from "../../components/CopyField/CopyField";
import jsPDF from "jspdf";
import Jost from "../../assets/fonts/Jost-400.ttf";
import { LoadFileBase64 } from "../../helpers/loadFileAsBase64";
import { buy, getDocs, sendReceipt } from "../../api/main";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";
import ImageLoader from "../../components/ImageLoader/ImageLoader";
import BuyStocksBlock from "../../components/BuyStocksBlock/BuyStocksBlock";

import banner1 from "../../assets/images/main/banner1.jpg";
import banner2 from "../../assets/images/main/banner2.jpg";
import { WSContext } from "../../context/WebSocketContext";
import { useNavigate } from "react-router-dom";
import { requisitesEcliptics } from "../../../requisitesEcliptics";
import dayjs from "dayjs";
import qr from "../../assets/qr/qr_ecliptics.jpg";

const fontAsBase64 = await LoadFileBase64(Jost);

export default function Personal() {
  const [isLoading, setIsLoading] = useState(false);
  const [chequePhoto, setChequePhoto] = useState(null);
  const { main, user } = useContext(WSContext);
  const navigate = useNavigate();

  const [dogovor, setDogovor] = useState("");

  const modalRef = useRef(null);
  const modalReceiptRef = useRef(null);
  const modalDocsRef = useRef(null);
  const imageLoaderRef = useRef(null);
  const needVerificationModalRef = useRef(null);

  const hash = useRef("");
  const packageData = useRef({});

  const [cookies] = useCookies(["access_token"]);
  const token = cookies?.access_token;

  const maxStocks = 20;
  const currentStocks = main?.count || 0;

  const clearFields = () => {
    setChequePhoto(null);
    imageLoaderRef?.current?.clear();
  };

  const requisitesWithPrice = [
    ...requisitesEcliptics,
    {
      label: "Сумма",
      text: new Intl.NumberFormat("ru-RU").format(packageData.current.showingSumm),
    },
  ];

  const generatePdf = () => {
    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.height;

    doc.addFileToVFS("Jost-400.ttf", fontAsBase64);
    doc.addFont("Jost-400.ttf", "Jost", "normal");
    doc.setFont("Jost", "normal");

    const Y_PAGE_START = 10;

    let x = 10;
    let y = Y_PAGE_START;
    const lineHeight = 10;

    requisitesWithPrice.forEach(req => {
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

    doc.save("requisits.pdf");
  };

  const buyPackage = async (summ, count, type, showingSumm) => {
    if (user?.role < 1) {
      needVerificationModalRef.current.open();
      return;
    }

    try {
      setIsLoading(true);
      const data = await getDocs(token, summ, count, type, 2);
      modalDocsRef?.current?.open();
      packageData.current = {
        summ,
        count,
        type,
        // showingSumm: showingSumm * 1.03,
        showingSumm,
      };
      setDogovor(data?.dogovor);
    } catch (e) {
      if (e.status === 403) {
        toast.error("Покупка акции доступна только верифицированным пользователям");
        return;
      }

      toast.error(e?.response?.data.detail || "Произошла ошибка, попробуйте снова");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBuy = async () => {
    try {
      modalDocsRef?.current?.close();
      setIsLoading(true);
      const data = await buy(token, packageData.current.summ, packageData.current.count, packageData.current.type, 2);
      modalRef?.current?.open();
      hash.current = data.hash;
    } catch (e) {
      console.log(e);
      if (e.status === 403) {
        toast.error("Покупка акции доступна только верифицированным пользователям");
        return;
      }

      if (e.status === 408) {
        toast.error("Подтвердите оплату или отмените инвойс");
        return;
      }

      toast.error("Произошла ошибка, попробуйте снова");
    } finally {
      setIsLoading(false);
    }
  };

  const onReceipt = () => {
    modalRef?.current?.close();
    modalReceiptRef?.current?.open();
  };

  const onSendReceipt = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("receipt", chequePhoto);
      await sendReceipt(token, hash?.current, formData);
      modalReceiptRef?.current?.close(false);
      toast.success("Уже проверяем Вашу оплату");
      packageData.current = {};
      clearFields();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useOpenPage("Main");

  return (
    <>
      {isLoading && <Loader />}
      <div className={style.container}>
        <div className={style.topBlock}>
          <div className={style.dividend}>
            <h5 className={style.dividendTitle}>Выплаченно бонусов</h5>
            <div className={style.dividendCount}>
              <p>{main?.dividend || 0} ₽</p>
              <Icon width={24} name="monets" style={{ color: "#8FE8A3" }} />
            </div>
          </div>
          <div className={style.dividend}>
            <h5 className={style.dividendTitle}>Стоимость СФО* на одну акцию</h5>
            <div className={style.dividendCount}>
              <p>{main?.current_price || 0} ₽</p>
              <Icon width={24} name="monets" style={{ color: "#8FE8A3" }} />
            </div>
            <p
              style={{
                marginTop: "10px",
                color: "#8e8e8e",
                letterSpacing: "-0.01rem",
              }}>
              *Совокупные финансовые обязательства на одну акцию
            </p>
          </div>
          <div className={style.dividend}>
            <h5 className={style.dividendTitle}>Баланс</h5>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}>
              <div className={style.dividendCount}>
                <p>{main?.balance} ₽</p>
                <Icon width={24} name="monets" style={{ color: "#8FE8A3" }} />
              </div>
              {/* <Button
                style={{
                  width: "auto",
                  backgroundColor: "#42E39F",
                }}>
                Вывести
              </Button> */}
            </div>
          </div>
          <div className={style.stocks}>
            <div className={style.stocksHeader}>
              <div className={style.stocksRemained}>
                {currentStocks >= maxStocks ? "Акционер" : "Осталось до акционера"}
              </div>
            </div>
            <div className={style.stocksBought}>
              Куплено акций <span>{currentStocks}</span>
              {currentStocks < maxStocks && <span>/{maxStocks}</span>}
            </div>
            <div className={style.stocksChart}>
              <div
                style={{
                  width: `${Math.min((currentStocks / maxStocks) * 100, 100)}%`,
                }}
                className={style.stocksChartLine}></div>
            </div>
          </div>
        </div>

        <div className={style.buyStocks}>
          {currentStocks < maxStocks ? (
            <BuyStocksBlock
              title="Поштучно"
              smallTitle="Покупка акций поштучно"
              label="Кол-во акций"
              bgSrc={banner1}
              min={1}
              onClick={(sum, count) => buyPackage(sum, count, 0, sum * main?.current_price)}
              backgroundColor={"#3FF6BF"}
              green
            />
          ) : (
            <BuyStocksBlock
              title="На указанную сумму"
              smallTitle="Покупка акций на указанную сумму"
              label="Сумма"
              bgSrc={banner1}
              min={0}
              isAgreement={false}
              onClick={(count, sum) => buyPackage(sum, count, 0, count)}
              backgroundColor={"#3FF6BF"}
              green
            />
          )}
          {/* <BuyStocksBlock
            title="Покупка пакетом"
            smallTitle="Покупка акций пакетом"
            label="Кол-во акций в пакете"
            bgSrc={bg2}
            min={10}
            max={500}
            onClick={(summ, count) =>
              buyPackage(summ, count, 2,summ * cabinet?.current_price)
            }
          /> */}
          {!main?.fix_timestamp || 0 ? (
            <BuyStocksBlock
              title="Рассрочка"
              smallTitle="Рассрочка"
              label="Кол-во акций"
              bgSrc={banner2}
              buttonLabel="Взять в рассрочку"
              min={10}
              onClick={(summ, count) => buyPackage(summ, count, 3, summ * main?.current_price)}
              backgroundColor={"#59F2BB"}
              green
            />
          ) : (
            <BuyStocksBlock
              title="Рассрочка"
              smallTitle={`Рассрочка до ${dayjs(main?.fix_timestamp * 1000).format("DD.MM.YYYY")}`}
              label="Сумма"
              bgSrc={banner2}
              buttonLabel="Оплатить"
              min={1}
              isAgreement={false}
              onClick={(summ, count) => buyPackage(count, summ, 3, summ)}
              backgroundColor={"#59F2BB"}
              green
            />
          )}
        </div>
      </div>
      <Modal onClose={clearFields} modalRef={modalRef}>
        <div className={style.modal}>
          <h5 className={style.modalTitle}>Реквизиты для оплаты</h5>
          <div
            style={{
              maxWidth: "50%",
              margin: "0 auto",
            }}>
            <img
              src={qr}
              style={{
                width: "100%",
                height: "auto",
              }}
            />
          </div>
          <div className={style.modalContainer}>
            {requisitesWithPrice.map((req, i) => (
              <CopyField key={i} label={req.label} text={req.text} />
            ))}
            <Button onClick={onReceipt} type="primary">
              Я оплатил
            </Button>
            <button onClick={generatePdf}>Скачать PDF с реквизитами</button>
          </div>
        </div>
      </Modal>
      <Modal onClose={() => modalRef?.current?.open()} modalRef={modalReceiptRef}>
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
      <Modal big={true} modalRef={modalDocsRef}>
        <div className={style.docModal}>
          <div className={style.doc} dangerouslySetInnerHTML={{ __html: dogovor }}></div>
          <div className={style.actionBtns}>
            <Button onClick={confirmBuy}>Согласен</Button>
            <Button onClick={() => modalDocsRef?.current?.close()} type="outlined">
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
      <Modal modalRef={needVerificationModalRef}>
        <div className={style.needVerification}>
          <h5 className={style.needVerification__title}>Пройдите верификацию</h5>
          <p className={style.needVerification__descr}>Перед покупкой необходимо пройти верификацию</p>
          <Button onClick={() => navigate("/profile/verification")}>Пройти</Button>
          <Button onClick={() => needVerificationModalRef?.current?.close()} type="outlined">
            Отмена
          </Button>
        </div>
      </Modal>
    </>
  );
}