import { useState } from "react";
import Icon from "../Icon/Icon";
import style from './Select.module.scss'
import classNames from "classnames";


function Select({ listItems, cb, defaultIndex = 0 }) {
  const [list, setList] = useState(listItems);
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [isShowed, setIsShowed] = useState(false);

  const closeList = () => {
    setIsShowed(false);
  };

  const handleSelect = (item, i) => {
    setSelectedIndex(i);
    closeList();
    if (cb) {
      cb(item.value);
    }
  };


  return (
    <div className={style.container}>
      <div
        className={style.header}
        onClick={() => setIsShowed((prev) => !prev)}
      >
        <p >
          {list[selectedIndex].title}
        </p>
        <Icon
          name="arrow-down"
          width={15}
          style={{color:'rgba(0,0,0,0.25', transform: isShowed ? 'rotateX(180deg)' : 'rotateX(0deg)'}}
        />
      </div>
      <div className={classNames(style.contentContainer, { [style.contentContainerVisible] : isShowed})}>
        <ul >
          {list.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSelect(item, i)}
              className={style.selectItem}
            >
              {item.title}
            </li>
          ))}
        </ul>
        <div
          onClick={closeList}
          
        ></div>
      </div>
    </div>
  );
}

export default Select;
