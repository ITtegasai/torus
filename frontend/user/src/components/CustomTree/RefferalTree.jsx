import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
  memo,
} from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Group,
  Circle,
  Image,
  Line,
} from "react-konva";
import useImage from "use-image";
import structureImage from "../../assets/icons/structure.svg";
import infoImage from "../../assets/icons/info.svg";
import useWSSend from "../../hooks/useWSSend";
import { WSContext } from "../../context/WebSocketContext";
import style from "./RefferalTree.module.scss";
import Button from "../Button/Button";
import defaultImage from "../../assets/images/user-image.png";

const TreeNode = memo(({ node, x, y, onAddChild, onShowPopup, level, idx }) => {
  const [structureImg] = useImage(structureImage);
  const [infoImg] = useImage(infoImage);
  const [image] = useImage(node.image);
  const [defaultImg] = useImage(defaultImage);

  const textWidth = 140;

  const hasChildren = node?.my_structure?.length > 2;

  return (
    <Group>
      <Rect
        x={x - 98}
        y={y}
        width={180}
        height={188}
        fill={level === 0 ? "#8FC4E8" : "white"}
        stroke="black"
        strokeWidth={0}
        cornerRadius={12}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowBlur={30}
        shadowOffset={{ x: 0, y: 0 }}
      />
      <Group>
        <Circle
          x={x - 10}
          y={y - 5}
          radius={35}
          fill="#E8E8E8"
          strokeWidth={0}
        />
        {image ? (
          <Image
            cornerRadius={35}
            x={x - 45}
            y={y - 40}
            width={70}
            height={70}
            image={image}
          />
        ) : (
          <Image
            cornerRadius={35}
            x={x - 46}
            y={y - 40}
            width={75}
            height={70}
            image={defaultImg}
          />
        )}
      </Group>

      <Text
        x={x - 10 - textWidth / 2}
        y={y + 60}
        text={node.name}
        fontSize={14}
        width={textWidth}
        align="center"
      />

      <Group>
        <Group
          x={x - 75}
          y={y + 110}
          onTouchStart={() => onAddChild(level, idx)}
          onClick={() => onAddChild(level, idx)}
          width={30}
          height={30}
        >
          {((structureImg && hasChildren) || level === 0) && (
            <Image
              width={50}
              height={50}
              image={structureImg}
              shadowColor="rgba(0, 0, 0, 0.1)"
              shadowBlur={30}
              shadowOffset={{ x: 0, y: 0 }}
            />
          )}
        </Group>

        <Group
          x={x + 5}
          y={y + 110}
          onTouchStart={() => onShowPopup(node, x, y)}
          onClick={() => onShowPopup(node, x, y)}
          width={30}
          height={30}
        >
          {infoImg && (
            <Image
              width={50}
              height={50}
              image={infoImg}
              shadowColor="rgba(0, 0, 0, 0.1)"
              shadowBlur={30}
              shadowOffset={{ x: 0, y: 0 }}
            />
          )}
        </Group>
      </Group>
    </Group>
  );
});

const ReferralTree = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [popup, setPopup] = useState({
    visability: false,
    data: null,
    x: 0,
    y: 0,
  });
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const flag = useRef(false);

  const { structure, setStructure } = useContext(WSContext);
  const getData = useWSSend();

  const handleWheel = useCallback(
    (e) => {
      e.evt.preventDefault();

      const scaleBy = 1.1;
      const oldScale = scale;
      const newScale =
        e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

      if (newScale < 0.1 || newScale > 3) return;

      setScale(newScale);
    },
    [scale]
  );

  const addChild = useCallback(
    (level, idx) => {
      const addChildRecursively = (currentNodes, currLevel) => {
        return currentNodes.map((node, index) => {
          if (currLevel === level) {
            if (index === idx) {
              if (node.children.length)
                return { ...node, children: node.children };
              getData("Structure", { filter: node.id, level, idx });
            }
            return { ...node, children: [] };
          }

          return {
            ...node,
            children: addChildRecursively(node.children, currLevel + 1),
          };
        });
      };
      setStructure(addChildRecursively(structure, 0));
    },
    [structure, setStructure]
  );

  const showPopup = (node, x, y) => {
    setPopup((prev) => {
      if (prev.visability && prev.data.id === node.id) {
        return { ...prev, visability: !prev.visability };
      }
      return { data: node, x, y, visability: true };
    });
  };

  const centerTree = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const stage = stageRef.current;

      if (flag.current) {
        setPosition({
          x: container.width / 2,
          y: container.height / 5,
        });
        flag.current = false;
      } else {
        setPosition({
          x: container.width / 2 - 0.1,
          y: container.height / 5 - 0.1,
        });
        flag.current = true;
      }

      stage.width(container.width);
      stage.height(container.height);
    }
  }, []);

  const resetTree = () => {
    setScale(1);
    centerTree();
  };

  useEffect(() => {
    centerTree();
    window.addEventListener("orientationchange", centerTree);
    return () => window.removeEventListener("orientationchange", centerTree);
  }, [centerTree]);

  const renderTree = (node, x, y, level, index) => {
    const newLevel = level + 1;
    const gapX = 250;
    const gapY = 350;
    const childrenXStart = x - (node.children.length - 1) * (gapX / 2);

    let verticalLine = null;
    let horizontalLine = null;

    if (node.children.length > 0) {
      verticalLine = (
        <Line
          points={[x - 10, y + 180, x - 10, y + 180 + gapY / 4]}
          stroke="#E8E8E8"
          strokeWidth={2}
        />
      );

      horizontalLine = (
        <Line
          points={[
            childrenXStart - 10,
            y + 180 + gapY / 4,
            childrenXStart + (node.children.length - 1) * gapX - 10,
            y + 180 + gapY / 4,
          ]}
          stroke="#E8E8E8"
          strokeWidth={2}
        />
      );
    }

    return (
      <React.Fragment key={node.id}>
        {verticalLine}
        {horizontalLine}
        <TreeNode
          node={node}
          x={x}
          y={y}
          onAddChild={addChild}
          onShowPopup={showPopup}
          level={level}
          idx={index}
        />
        {node.children.map((child, index) => {
          const childVerticalLine = (
            <Line
              points={[
                childrenXStart + index * gapX - 10,
                y + gapY,
                childrenXStart + index * gapX - 10,
                y + gapY - 83,
              ]}
              stroke="#E8E8E8"
              strokeWidth={2}
            />
          );

          return (
            <React.Fragment key={child.id}>
              {childVerticalLine}
              {renderTree(
                child,
                childrenXStart + index * gapX,
                y + gapY,
                newLevel,
                index
              )}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", zIndex: 100, right: 0 }}>
        <div className={style.rowGroupBtns}>
          <Button type="outlined" onClick={resetTree}>
            В начало структуры
          </Button>
        </div>
        <div className={style.colGroupBtns}>
          <Button
            type="outlined"
            onClick={() => setScale((prev) => Math.min(prev * 1.1, 3))}
          >
            +
          </Button>
          {scale > 0.1 && (
            <Button
              type="outlined"
              onClick={() => setScale((prev) => Math.max(prev / 1.1, 0.1))}
            >
              -
            </Button>
          )}
        </div>
      </div>
      <Stage
        draggable
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        ref={stageRef}
        onWheel={handleWheel}
      >
        <Layer>{renderTree(structure[0], 0, 0, 0, 0)}</Layer>
        {popup.visability && (
          <Layer>
            <Group>
              <Rect
                x={popup.x + 100}
                y={popup.y + 80}
                width={10}
                height={10}
                rotation={45}
                fill="black"
                stroke="black"
                strokeWidth={0}
                shadowColor="rgba(0, 0, 0, 0.1)"
                shadowBlur={30}
                shadowOffset={{ x: 0, y: 0 }}
              />
              <Rect
                x={popup.x + 100}
                y={popup.y + 30}
                width={290}
                height={115}
                fill="black"
                stroke="black"
                strokeWidth={0}
                cornerRadius={12}
                shadowColor="rgba(0, 0, 0, 0.1)"
                shadowBlur={30}
                shadowOffset={{ x: 0, y: 0 }}
              />
              <Text
                x={popup.x + 120}
                y={popup.y + 50}
                text="Логин:"
                fontSize={12}
                fill="white"
              />

              <Text
                x={popup.x + 200}
                y={popup.y + 50}
                text={
                  popup?.data?.username.length > 20
                    ? popup?.data?.username.slice(0, 20) + "..."
                    : popup?.data?.username
                }
                fontSize={12}
                fill="white"
              />

              <Text
                x={popup.x + 120}
                y={popup.y + 70}
                text="Email:"
                fontSize={12}
                fill="white"
              />

              <Text
                x={popup.x + 200}
                y={popup.y + 70}
                text={
                  popup?.data?.email.length > 20
                    ? popup?.data?.email.slice(0, 20) + "..."
                    : popup?.data?.email
                }
                fontSize={12}
                fill="white"
              />

              <Text
                x={popup.x + 120}
                y={popup.y + 90}
                text="Имя:"
                fontSize={12}
                fill="white"
              />

              <Text
                x={popup.x + 200}
                y={popup.y + 90}
                text={
                  popup?.data?.name.length > 20
                    ? popup?.data?.name.slice(0, 20) + "..."
                    : popup?.data?.name
                }
                fontSize={12}
                fill="white"
              />

              <Text
                x={popup.x + 120}
                y={popup.y + 110}
                text="ЛО:"
                fontSize={12}
                fill="white"
              />

              <Text
                x={popup.x + 200}
                y={popup.y + 110}
                text={popup?.data?.lo}
                fontSize={12}
                fill="white"
              />
            </Group>
          </Layer>
        )}
      </Stage>
    </div>
  );
};

export default ReferralTree;
