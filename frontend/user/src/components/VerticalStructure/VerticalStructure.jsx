import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SvgViewer } from "../SvgViewer/SvgViewer";
import Tree from "../Tree/Tree";
import { WSContext } from "../../context/WebSocketContext";
import useWSSend from "../../hooks/useWSSend";
import classNames from "classnames";
import style from './VerticalStructure.module.scss';

export default function VerticalStructure({ reff }) {
  const [fullScreen, setFullScreen] = useState(false);
  const [orientation, setOrientation] = useState(false);
  const [scale,setScale] = useState(1)
  const svgRef = useRef(null);
  const [popup, setPopup] = useState({
    y: 0,
    x: 0,
    data: null,
    visibility: false,
  });

  const svgWidth = useRef(0)

  const { structure, setStructure } = useContext(WSContext);
  const getData = useWSSend();

  const handleClick = useCallback((event, data) => {
    const square = event.target;
    const svg = svgRef.current;

    console.log(svg)

    //1350
  
    const bbox = square.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    svgWidth.current = svgRect.width;
  
    const x = (bbox.left - svgRect.left + bbox.width / 2) / scale;
    const y = (bbox.top - svgRect.top + bbox.height / 2) / scale;
  
    setPopup({ x, y, data, visibility: true });
  },[scale])
  

  const handleAddChild = useCallback(
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
    [structure]
  );

  const changeOrientation = () => {
    setOrientation((prev) => !prev);
  };

  const closePopup = () => {
      setPopup((prev) => ({...prev, visibility:false}))
  }

  useEffect(() => {
    window.addEventListener('changeSvgPosition', closePopup);

    return () => window.removeEventListener('changeSvgPosition', closePopup)
  },[])

  useEffect(() => {
    addEventListener("orientationchange", changeOrientation);

    if (reff.current) {
      const widthContainer = reff.current.clientWidth;
      const windowWidth = window.innerWidth;
      let centerX = widthContainer / 2 - 110;

      if (fullScreen) {
        centerX = windowWidth / 2 - 110;
      } else {
        centerX = widthContainer / 2 - 110;
      }

      if (
        (structure.length && !structure[0].x) ||
        (structure[0]?.x && structure[0].x !== centerX)
      ) {
        setStructure((prev) => {
          const mainUser = prev[0];
          mainUser.x = centerX;
          return [mainUser];
        });
      }
    }

    return () => {
      removeEventListener("orientationchange", changeOrientation);
    };
  }, [reff, fullScreen, orientation, structure]);

  if (!structure[0]?.x) return;

  return (
    <>
      <SvgViewer svgRef={svgRef} changeScreen={setFullScreen} onScaleChange={setScale}>
        <Tree
          handleClick={handleClick}
          nodes={structure}
          handleAddChild={handleAddChild}

        />
        {popup.visibility && <g viewBox="0 0 299 136" transform={`translate(${popup.x}, ${popup.y + 10})`}>
          <rect x="8" width="291" height="136" rx="12" fill="#11181F"/>
          <path d="M1.97318 69.5664C0.964528 68.7657 0.964529 67.2343 1.97318 66.4336L8.75649 61.0486C10.0672 60.0081 12 60.9415 12 62.615L12 73.385C12 75.0585 10.0672 75.9919 8.75648 74.9514L1.97318 69.5664Z" fill="#11181F"/>
        </g>}
      </SvgViewer>
    </>
  );
}
