import { useMemo } from "react";

export const usePagination = ({
    current, count
}) => {
  let pagination = [];
  let arr = Array.from({ length: count }, (_, i) => i + 1);

  if (count > 6) {
    if(current > 2 && current < arr.length - 3){
      pagination = [arr[0], '...', arr[current - 1], arr[current], arr[current + 1], '...', arr[arr.length - 1]]
    } else if (current > arr.length - 4){
      pagination = [arr[0], '...', ...arr.slice(arr.length - 4, arr.length)]
    } else {
      pagination = [...arr.slice(0, 4), '...', arr[arr.length - 1]]
    }
  } else {
    pagination = [...arr];
  }

  return pagination;
};