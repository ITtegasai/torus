import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import Pagination from "../Pagination/Pagination";
import style from "./Table.module.scss";

export default memo(function Table({
  header,
  totalData,
  rowItem,
  pagination,
  tableSize = 10,
  count = null,
  onChangePage
}) {

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
          <tbody>{totalData.map((row, i) => rowItem(row, i))}</tbody>
        </table>
      </div>
      {pagination && (
        <Pagination
          pageCount={Math.ceil(count/tableSize)}
          data={totalData}
          pageSize={tableSize}
          onChange={(pageNumber) => onChangePage(pageNumber)}
        />
      )}
    </>
  );
});
