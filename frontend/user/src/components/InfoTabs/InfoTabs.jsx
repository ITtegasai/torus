import style from "./InfoTabs.module.scss";

export default function InfoTabs({ text }) {
  return (
    <div className={style.tab}>
      {text.map((word, i) => (
        <span key={i}>{word}</span>
      ))}
    </div>
  );
}
