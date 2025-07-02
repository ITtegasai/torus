import { useContext, useEffect } from "react";
import { PageNames, WSContext } from "../context/WebSocketContext";

export default function useOpenPage(pageName, params = {}, deps = []) {
  const { ws, isReady, currentPage, WSParams, setLoadingState } = useContext(WSContext);

  useEffect(() => {
    currentPage.current = pageName;
    WSParams.current = params;
    if (isReady && pageName !== null) {
      ws?.send(JSON.stringify({ data: { page: pageName, ...params } }));
      setLoadingState(prev => ({
        ...prev,
        [PageNames[pageName]]: true,
      }));
    }
  }, [isReady, ...deps]);

  return { ws, isReady, currentPage };
}
