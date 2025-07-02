import React, { useState } from "react";
import CustomSelect from "../CustomSelect";
import style from "./style.module.scss";
import Icon from "../Icon";

const pageCounts = [
  {
    title: 10,
    value: 0,
  },
  {
    title: 20,
    value: 1,
  },
  {
    title: 30,
    value: 2,
  },
  {
    title: 50,
    value: 3,
  },
  {
    title: 100,
    value: 4,
  },
];

export default function Pagination({ count, onChangePerCount, onChangePage }) {
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const maxPage = Math.ceil(count / perPage);
  const maxInPage = perPage * currentPage;
  const minInPage = maxInPage - perPage + 1;

  const onUpPage = () => {
    if (currentPage + 1 <= maxPage) {
      setCurrentPage(prev => prev + 1);
      onChangePage && onChangePage(currentPage + 1);
    }
  };

  const onDownPage = () => {
    if (currentPage - 1 > 0) {
      setCurrentPage(prev => prev - 1);
      onChangePage && onChangePage(currentPage - 1);
    }
  };

  const onChangePerPage = val => {
    const countPageBack = Math.ceil(minInPage / val);
    setCurrentPage(countPageBack);
    onChangePage && onChangePage(countPageBack);
    setPerPage(val);
    onChangePerCount(pageCounts[val].title);
  };

  return (
    <div className={style.pagination}>
      <div className={style.pagination__perPage}>
        <p className={style.pagination__perPageTitle}>Rows per page:</p>
        <CustomSelect top={true} title={""} initial={0} options={pageCounts} onChoose={onChangePerPage} />
      </div>
      <div className={style.pagination__action}>
        {minInPage}-{Math.min(maxInPage, count)} of {count} items
        <div className={style.pagination__actionBtns}>
          <button disabled={currentPage === 1} onClick={onDownPage}>
            <Icon name="arrow-left" width={24} />
          </button>
          <button disabled={currentPage === maxPage} onClick={onUpPage}>
            <Icon name="arrow-right" width={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
