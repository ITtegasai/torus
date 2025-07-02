import { useContext, useEffect } from "react";
import { WSContext } from "../context/WebSocketContext";

export default function useOpenPage(pageName, params = {}) {
  const { ws, isReady, currentPage, WSParams } = useContext(WSContext);

  useEffect(() => {
    currentPage.current = pageName;
    WSParams.current = params;
    if (isReady && pageName !== null) {
      ws?.send(JSON.stringify({ data: { page: pageName, ...params } }));
    }
  }, [isReady]);

  return { ws, isReady, currentPage };
}
