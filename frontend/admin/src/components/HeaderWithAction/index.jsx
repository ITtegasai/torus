import style from "./style.module.scss";

export default function HeaderWithAction({ title, children }) {
  return (
    <header className={style.header}>
      <h2 className={style.header__title}>{title}</h2>
      <div className={style.header__actionBtn}>{children}</div>
    </header>
  );
}
