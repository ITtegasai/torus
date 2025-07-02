import { memo } from "react";
import style from "./style.module.scss";

export default memo(function Table({ header, data, rowItem, pagination, tableSize = 10, count = null, onChangePage }) {
  return (
    <>
      <div className={style.container}>
        <table className={style.table}>
          {Boolean(header.length) && (
            <thead>
              <tr>
                {header.map((col, i) => (
                  <th key={i}>{col}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>{data.map((row, i) => rowItem(row, i))}</tbody>
        </table>
      </div>
    </>
  );
});
