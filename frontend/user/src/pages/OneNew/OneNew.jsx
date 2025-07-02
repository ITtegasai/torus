import { useLocation, useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import style from "./OneNew.module.scss";
import useOpenPage from "../../hooks/useOpenPage";
import { useContext } from "react";
import { WSContext } from "../../context/WebSocketContext";

export default function OneNew() {
  const navigate = useNavigate();
  const {id} = useParams();
  const {news, isReady} = useContext(WSContext);

  useOpenPage("News", {
    filter: id
  })

  const oneNews = news[0] ?? {}

  return (
    <div className={style.container}>
      <div
        style={{ backgroundImage: `url(${oneNews.image})` }}
        className={style.preview}
      >
        <button className={style.backBtn} onClick={() => navigate(-1)}>
          <Icon name="arrow-left" width={16} />
          Назад
        </button>
        <h4 className={style.title}>{oneNews.name}</h4>
        <p className={style.date}>{oneNews.date}</p>
      </div>
      <p className={style.description}>{oneNews.full_description}</p>
    </div>
  );
}
