import { toast } from "react-toastify";
import { getReceipt } from "../../../api";
import Icon from "../../../components/Icon";
import style from "../Accounts.module.scss";
import classNames from "classnames";
import { useState } from "react";
import Loader from "../../../components/Loader/Loader";

export default function AccountsActions({ tx_hash, status, confirmOrAcceptPerchase, modalRef, setCurrentHash }) {
  const [isLoading, setIsLoading] = useState(false);

  const onOpen = () => {
    setCurrentHash(tx_hash);
    modalRef.current.open();
  };

  const handleGetReceipt = async () => {
    try {
      setIsLoading(true);
      const data = await getReceipt(tx_hash);
      if (!data.files) throw new Error("Файл отсутствует");

      const { filedata, filename = "document" } = data.files;
      const isPdf = filename.toLowerCase().endsWith(".pdf");
      const mimeType = isPdf ? "application/pdf" : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${filedata}`;

      const popup = window.open("", "_blank");
      if (popup) {
        popup.document.write(`
          <!doctype html>
          <html lang="ru">
            <head>
              <meta charset="UTF-8" />
              <title>${filename}</title>
              <style>
                html,body{${isPdf ? "min-width:80%;" : ""}margin:0;height:100%;display:flex;justify-content:center;align-items:center;background:#f0f0f0}
                embed, img{max-width:100%;max-height:100%;object-fit:contain}
              </style>
            </head>
            <body>
              ${isPdf ? `<embed src="${dataUrl}" type="application/pdf" width="100%" height="100%" />` : `<img src="${dataUrl}" />`}
            </body>
          </html>
        `);
        popup.document.close();
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error(e);
      toast.error(`Ошибка: ${e.message || e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className={style.actions}>
        <button
          disabled={status !== 1}
          onClick={onOpen}
          className={classNames(style.acceptBtn, style.acceptBtn_active)}>
          <Icon name="done" width={24} />
        </button>
        <button
          disabled={status === 0 || status === 2}
          onClick={() => confirmOrAcceptPerchase(2, tx_hash)}
          className={classNames(style.crossBtn, style.crossBtn_active)}>
          <Icon name="cross" width={24} />
        </button>
        <button disabled={status === 0} onClick={handleGetReceipt} className={style.actionBtn}>
          <Icon name="download" width={24} />
        </button>
      </div>
    </>
  );
}
