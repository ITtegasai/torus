import React, { useContext, useEffect, useState } from "react";
import useOpenPage from "../../hooks/useOpenPage";
import { WSContext } from "../../context/WebSocketContext";
import Loader from "../../components/Loader/Loader";
import style from "./About.module.scss";

export default function About() {
  const { about, isReady } = useContext(WSContext);
  useOpenPage("About");

  //временно

  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    fetch("/abt.html")
      .then((response) => response.text())
      .then((html) => setHtmlContent(html))
      .catch((error) => console.error("Error loading HTML:", error));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }}></div>;

  return (
    <>
      {!about.length && isReady && <Loader />}
      <div className={style.container}>
        <div dangerouslySetInnerHTML={{ __html: about }}></div>
      </div>
    </>
  );
}
