import style from "./style.module.scss";

export default function InfoTag({ name, info }) {
  return (
    <div className={style.infoTag}>
      <p className={style.infoTag__name}>{name}</p>
      <p className={style.infoTag__info}>{info}</p>
    </div>
  );
}
