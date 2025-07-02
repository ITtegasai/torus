import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import style from "./TableStructure.module.scss";
import { WSContext } from "../../context/WebSocketContext";
import useWSSend from "../../hooks/useWSSend";
import classNames from "classnames";
import TableLoader from "../TableLoader/TableLoader";

const TreeTable = React.memo(({ header, row, items }) => {
  return (
    <table className={style.table}>
      <thead>
        <tr>
          {header.map((col, i) => (
            <th key={i}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>{items?.map((item, i) => row(item, i))}</tbody>
    </table>
  );
});

const TableStructure = () => {
  const [breadcrumbs, setBreadCrumbs] = useState([]);
  const { structure, setStructure, structureData, structureQualifications, user } = useContext(WSContext);
  const [currentRow, setCurrentRow] = useState(null);
  const [currentStructure, setCurrentStructure] = useState(structure[0]);
  const [isLoading, setIsloading] = useState(false);
  const getData = useWSSend();

  const handleAddChild = useCallback(
    (user, level, idx) => {
      const addChildRecursively = (currentNodes, currLevel) => {
        return currentNodes.map((node, index) => {
          if (currLevel === level && index === idx) {
            if (node.children.length) return { ...node, children: node.children };
            getData("Structure", { filter: node.id, level, idx });
          }
          return {
            ...node,
            children: addChildRecursively(node.children, currLevel + 1),
          };
        });
      };

      if (user) {
        setCurrentRow(user);
      }
      setBreadCrumbs(prev => [...prev, { user: user, prev: currentStructure }]);
      setStructure(addChildRecursively(structure, 0));
    },
    [getData, currentStructure, structure],
  );

  // Функция для поиска дочерних узлов по имени родителя
  const findChildrenByParentName = useCallback((nodes, id) => {
    if (!id) return null;

    for (let node of nodes) {
      if (node.id === id) {
        return node;
      } else if (node.children?.length > 0) {
        const result = findChildrenByParentName(node.children, id);
        if (result) return result;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    if (currentRow?.id) {
      const foundNode = findChildrenByParentName(structure, currentRow.id);
      setCurrentStructure(foundNode || structure[0]);
    }
  }, [currentRow, findChildrenByParentName, structure]);

  const handleBreadcrumbClick = useCallback(
    (user, index) => {
      const parentNode = findChildrenByParentName(structure, user?.prev?.id) || structure[0];
      setCurrentStructure(parentNode);
      setBreadCrumbs(prev => prev.slice(0, index));
      setCurrentRow(parentNode);
    },
    [structure, findChildrenByParentName],
  );

  const renderRow = useCallback(
    (row, i) => (
      <tr key={i}>
        <td>{row.username}</td>
        <td>{breadcrumbs[breadcrumbs.length - 1]?.user.name || structure[0]?.name}</td>
        <td>{row.email}</td>
        <td>{structureQualifications[row.qualification]}</td>
        <td>{row.lo}</td>
        <td>{breadcrumbs.length + 1}</td>
        <td>
          {Boolean(Object.values(JSON.parse(row.my_structure)).length) && (
            <button className={style.openBtn} onClick={() => handleAddChild(row, breadcrumbs.length + 1, i)}>
              Развернуть
            </button>
          )}
        </td>
      </tr>
    ),
    [breadcrumbs, structure, handleAddChild],
  );

  return (
    <>
      <div className={style.breadcrumbs}>
        {breadcrumbs.map((user, index) => (
          <div
            className={classNames(style.breadcrumbs__item, {
              [style.breadcrumbs__item_active]: index === breadcrumbs.length - 1,
            })}
            key={index}
            onClick={() => handleBreadcrumbClick(user, index)}>
            / {user.user.name}
          </div>
        ))}
      </div>

      <div className={style.container}>
        {!isLoading && (
          <TreeTable
            header={["Логин", "Наставник", "E-mail", "Квалификация", "ЛО", "Уровень", ""]}
            items={currentStructure?.children}
            row={renderRow}
          />
        )}

        {isLoading && <TableLoader />}
      </div>
    </>
  );
};

export default TableStructure;
