import { useEffect, useState } from "react";
import Icon from "../Icon/Icon";
import style from "./Pagination.module.scss";
import classNames from "classnames";
import { usePagination } from "./usePagination";

export default function Pagination({
  data,
  pageSize,
  onChange,
  pageCount = null,
}) {
  const [current, setCurrent] = useState(0);
  const count = pageCount ? pageCount : Math.ceil(data.length / pageSize);

  const paginationPages = usePagination({ current, count });

  const plusOneStep = () => {
    if (current + 1 <= count - 1) {
      if (onChange) onChange(current + 1);
      setCurrent((prev) => {
        return prev + 1;
      });
    }
  };

  const plusTwoStep = () => {
    if (current + 1 <= count - 1) {
      if (onChange) onChange(current + 2);
      setCurrent((prev) => {
        return prev + 2;
      });
    }
  };

  const minusTwoStep = () => {
    if (current - 2 >= 0) {
      if (onChange) onChange(current - 2);
      setCurrent((prev) => {
        return prev - 2;
      });
    }
  };

  const minusOneStep = () => {
    if (current - 1 >= 0) {
      if (onChange) onChange(current - 1);
      setCurrent((prev) => {
        return prev - 1;
      });
    }
  };

  const changePage = (pageNumber) => {
    onChange && onChange(pageNumber);
    setCurrent(pageNumber);
  };

  return (
    count > 1 && (
      <div className={style.pagination}>
        <button
          disabled={current <= 1}
          onClick={minusTwoStep}
          className={style.paginationBtn}
          type="secondary"
        >
          <Icon name="double-arrow-left" width={16} />
        </button>
        <button
          disabled={current === 0}
          onClick={minusOneStep}
          className={style.paginationBtn}
          type="secondary"
        >
          <Icon name="arrow-left" width={16} />
        </button>
        {paginationPages.map((item, i) => {
          const isActive = item - 1 === current;
          return item === "..." ? (
            <span key={String(item + i)}>{item}</span>
          ) : (
            <button
              key={String(item + i)}
              onClick={() => {
                changePage(item - 1);
              }}
              className={classNames(style.paginationBtn, {
                [style.paginationActiveBtn]: isActive,
              })}
              type="secondary"
            >
              <span className={style.paginationNumber}>{item}</span>
            </button>
          );
        })}
        <button
          disabled={current === count - 1}
          onClick={plusOneStep}
          className={style.paginationBtn}
          type="secondary"
        >
          <Icon name="arrow-right" width={16} />
        </button>
        <button
          disabled={current > count - 3}
          onClick={plusTwoStep}
          className={style.paginationBtn}
          type="secondary"
        >
          <Icon name="double-arrow-right" width={16} />
        </button>
      </div>
    )
  );
}
