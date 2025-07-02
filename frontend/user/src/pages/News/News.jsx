import { useContext, useEffect, useState } from "react";
import Pagination from "../../components/Pagination/Pagination";
import style from "./News.module.scss";
import { Link } from "react-router-dom";
import useOpenPage from "../../hooks/useOpenPage";
import { WSContext } from "../../context/WebSocketContext";

export default function News() {
  const { news, isReady } = useContext(WSContext);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(calculatePageSize());

  useOpenPage("News");
  function calculatePageSize() {
    return window.innerWidth > 1200 ? 9 : 6;
  }

  const changeData = (page) => {
    setData(news?.slice(page * pageSize, (page + 1) * pageSize));
  };

  useEffect(() => {
    const handleResize = () => {
      setPageSize(calculatePageSize());
      changeData(0);
    };

    const mediaQueryLarge = window.matchMedia("(min-width: 1200px)");
    mediaQueryLarge.addEventListener("change", handleResize);

    return () => {
      mediaQueryLarge.removeEventListener("change", handleResize);
    };
  }, [news]);

  useEffect(() => {
    changeData(0);
  }, [news, pageSize]);

  return (
    <div className={style.container}>
      <div className={style.grid}>
        {data.map((newsItem, i) => (
          newsItem.active && (
            <Link
              key={i}
              to={`/news/${newsItem.id}`}
              style={{ backgroundImage: `url(${newsItem.image})` }}
              className={style.new}
            >
              <h4 className={style.title}>{newsItem.name}</h4>
              <p className={style.date}>{newsItem.date}</p>
            </Link>
          )
        ))}
      </div>
      <Pagination
        data={news}
        pageSize={pageSize}
        onChange={changeData}
        setData={setData}
      />
    </div>
  );
}
