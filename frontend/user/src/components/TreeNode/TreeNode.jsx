import React, { memo, useState } from "react";
import defaultUserImage from "../../assets/images/user-image.png";

const Node = ({
  node,
  name,
  x,
  y,
  image,
  children,
  handleAddChild,
  idx = 0,
  level = 0,
  my_structure,
  handleClick,
}) => {
  const nodeWidth = 120;
  const nodeHeight = 130;
  const horizontalSpacing = 150; // Отступ между узлами по горизонтали
  const verticalSpacing = 100; // Отступ между узлами по вертикали
  const [userImg, setUserImg] = useState(image);

  // Вычисляем начальное x для детей
  const totalWidth =
    children.length * (nodeWidth + horizontalSpacing) - horizontalSpacing;
  const startX = x - totalWidth / 2 + nodeWidth / 2;

  const isMain = level === 0;

  const handleAppendChild = () => {
    handleAddChild(level, idx);
  };

  const changeUserImageToDefault = () => {
    setUserImg(defaultUserImage);
  };

  return (
    <>
      {/* Линии, соединяющие с дочерними узлами */}
      {children &&
        children.map((child, index) => (
          <React.Fragment key={`${level}-${index}`}>
            <line
              x1={x + nodeWidth / 2}
              y1={y + nodeHeight}
              x2={x + nodeWidth / 2}
              y2={y + nodeHeight + verticalSpacing / 2}
              stroke="#E8E8E8"
              strokeWidth="1"
            />

            <line
              x1={x + nodeWidth / 2}
              y1={y + nodeHeight + verticalSpacing / 2}
              x2={
                startX + index * (nodeWidth + horizontalSpacing) + nodeWidth / 2
              }
              y2={y + nodeHeight + verticalSpacing / 2}
              stroke="#E8E8E8"
              strokeWidth="1"
            />

            <line
              x1={
                startX + index * (nodeWidth + horizontalSpacing) + nodeWidth / 2
              }
              y1={y + nodeHeight + verticalSpacing / 2}
              x2={
                startX + index * (nodeWidth + horizontalSpacing) + nodeWidth / 2
              }
              y2={y + nodeHeight + verticalSpacing}
              stroke="#E8E8E8"
              strokeWidth="1"
            />

            {/* Отображение дочерних узлов */}
            <Node
              node={child}
              idx={index}
              name={child.name}
              image={child.image}
              x={startX + index * (nodeWidth + horizontalSpacing)}
              y={y + nodeHeight + verticalSpacing}
              children={child.children}
              level={level + 1}
              handleAddChild={handleAddChild}
              my_structure={child.my_structure}
              handleClick={handleClick}
            />
          </React.Fragment>
        ))}

      {/* Основной узел */}
      <g>
        {!isMain && <ShadowFilter />}
        <rect
          x={x}
          y={y}
          width={nodeWidth}
          height={nodeHeight}
          rx="10"
          fill={isMain ? "#8FC4E8" : "#fff"}
          filter={!isMain ? "url(#shadow)" : undefined} // Применяем фильтр тени
        />
        <defs>
          <clipPath id={`roundedClip-${level}-${idx}`}>
            <circle cx={x + nodeWidth / 2} cy={y} r="25" />
          </clipPath>
        </defs>
        <circle cx={x + nodeWidth / 2} cy={y} r="25" fill="#E8E8E8" />
        <image
          key={image}
          x={x + nodeWidth / 2 - 40} // Центрируем по x
          y={y - 40} // Центрируем по y
          width="80"
          height="80"
          href={userImg}
          onError={changeUserImageToDefault}
          clipPath={`url(#roundedClip-${level}-${idx})`}
        />
        <text
          x={x + nodeWidth / 2}
          y={y + 50}
          textAnchor="middle"
          fill={isMain ? "white" : "black"}
        >
          {name}
        </text>

        {/* Иконки ниже */}
        {my_structure.length > 2 && (
          <g
            onClick={handleAppendChild}
            style={{ cursor: "pointer" }}
            transform={`translate(${x + 20}, ${y + 80})`}
          >
            {!isMain && <ShadowFilter />}
            <rect
              width="28"
              height="28"
              fill={isMain ? "#8FC4E8" : "white"}
              stroke={isMain ? "white" : "#8FC4E8"}
              rx={5}
              ry={5}
              filter={!isMain ? "url(#shadow)" : undefined}
            />
            <g
              transform={`translate(5, 3) scale(0.85)`}
              clipPath="url(#clip0_556_498)"
            >
              <path
                d="M19.7955 15.9672H19.1843V15.1954C19.1843 13.3679 17.6975 11.8812 15.87 11.8812H14.5865H11.688V9.02678H13.5214C14.4256 9.02678 15.1612 8.29116 15.1612 7.38693V3.40645C15.1612 2.50226 14.4256 1.7666 13.5214 1.7666H8.62302C7.71884 1.7666 6.98322 2.50222 6.98322 3.40645V7.38689C6.98322 8.29108 7.71884 9.02674 8.62302 9.02674H10.4564V11.8811H7.59903H6.02801C4.20052 11.8811 2.71386 13.3679 2.71386 15.1953V15.9672H2.07521C1.17098 15.9672 0.435364 16.7028 0.435364 17.607V19.5137C0.435364 20.4179 1.17098 21.1535 2.07521 21.1535H4.58397C5.48816 21.1535 6.22378 20.4179 6.22378 19.5137V17.607C6.22378 16.7028 5.48816 15.9672 4.58397 15.9672H3.9454V15.1954C3.9454 14.047 4.87965 13.1128 6.02797 13.1128H7.59899H10.4564V15.9672H9.81781C8.91358 15.9672 8.17796 16.7028 8.17796 17.607V19.5137C8.17796 20.4179 8.91358 21.1535 9.81781 21.1535H12.3266C13.2308 21.1535 13.9664 20.4179 13.9664 19.5137V17.607C13.9664 16.7028 13.2308 15.9672 12.3266 15.9672H11.688V13.1128H14.5865H15.8701C17.0185 13.1128 17.9527 14.047 17.9527 15.1954V15.9672H17.2868C16.3826 15.9672 15.6469 16.7028 15.6469 17.607V19.5137C15.6469 20.4179 16.3826 21.1535 17.2868 21.1535H19.7955C20.6997 21.1535 21.4354 20.4179 21.4354 19.5137V17.607C21.4354 16.7028 20.6997 15.9672 19.7955 15.9672ZM4.58401 17.1988C4.80911 17.1988 4.99224 17.3819 4.99224 17.607V19.5137C4.99224 19.7388 4.80911 19.9219 4.58401 19.9219H2.07525C1.85016 19.9219 1.66698 19.7388 1.66698 19.5137V17.607C1.66698 17.3819 1.85016 17.1988 2.07525 17.1988H4.58401ZM12.3266 17.1988C12.5517 17.1988 12.7348 17.3819 12.7348 17.607V19.5137C12.7348 19.7388 12.5517 19.9219 12.3266 19.9219H9.81785C9.59276 19.9219 9.40958 19.7388 9.40958 19.5137V17.607C9.40958 17.3819 9.59276 17.1988 9.81785 17.1988H12.3266ZM8.62302 7.7952C8.39793 7.7952 8.2148 7.61203 8.2148 7.38693V3.40645C8.2148 3.18135 8.39793 2.99818 8.62302 2.99818H13.5214C13.7465 2.99818 13.9296 3.18131 13.9296 3.40645V7.38689C13.9296 7.61198 13.7465 7.79516 13.5214 7.79516H8.62302V7.7952ZM20.2038 19.5137C20.2038 19.7388 20.0206 19.922 19.7955 19.922H17.2868C17.0617 19.922 16.8785 19.7388 16.8785 19.5137V17.6071C16.8785 17.382 17.0617 17.1988 17.2868 17.1988H19.7955C20.0206 17.1988 20.2038 17.3819 20.2038 17.6071V19.5137Z"
                fill={isMain ? "#fff" : "#1C1C1C"}
              />
            </g>
          </g>
        )}

        <g
          onClick={(e) => handleClick(e, node)}
          style={{ cursor: "pointer" }}
          transform={`translate(${x + 70}, ${y + 80})`}
        >
          {!isMain && <ShadowFilter />}
          <rect
            width="28"
            height="28"
            fill={isMain ? "#8FC4E8" : "white"}
            stroke={isMain ? "white" : "#8FC4E8"}
            rx={5}
            ry={5}
            filter={!isMain ? "url(#shadow)" : undefined}
          />
          <g
            transform={`translate(5, 4) scale(0.85)`}
            clipPath="url(#clip0_556_498)"
          >
            <path
              fill="transparent"
              d="M10.8042 19.6631C15.3347 19.6631 19.0073 15.9904 19.0073 11.46C19.0073 6.9295 15.3347 3.25684 10.8042 3.25684C6.27374 3.25684 2.60107 6.9295 2.60107 11.46C2.60107 15.9904 6.27374 19.6631 10.8042 19.6631Z"
              stroke={!isMain ? "black" : "white"}
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.8042 15.7256V11.1318"
              stroke={!isMain ? "black" : "white"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <ellipse
              cx="10.8042"
              cy="7.95996"
              rx="0.875"
              ry="0.875"
              fill={!isMain ? "black" : "white"}
            />
          </g>
        </g>
      </g>
    </>
  );
};

export default memo(Node);

const ShadowFilter = () => (
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
      <feOffset dx="0" dy="0" result="offsetblur" />
      <feFlood floodColor="rgba(0, 0, 0, 0.1)" />
      <feComposite in2="offsetblur" operator="in" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);
