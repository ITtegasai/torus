import React, { useContext, useEffect, useState } from "react";
import useOpenPage from "../../hooks/useOpenPage";
import { WSContext } from "../../context/WebSocketContext";
import Loader from "../../components/Loader/Loader";
import style from "./Vacancy.module.scss";

export default function Vacancy() {
//   const { ab, isReady } = useContext(WSContext);
//   useOpenPage("Vacancy");

  //временно

  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    fetch("/vacancy-page.html")
      .then((response) => response.text())
      .then((html) => setHtmlContent(html))
      .catch((error) => console.error("Error loading HTML:", error));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }}></div>;

  return (
    <>
      {!Vacancy.length && isReady && <Loader />}
      <div className={style.container}>
        <div dangerouslySetInnerHTML={{ __html: Vacancy }}></div>
      </div>
    </>
  );
}
