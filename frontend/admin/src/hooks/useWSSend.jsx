import { useContext } from "react";
import { PageNames, WSContext } from "../context/WebSocketContext";

export default function useWSSend() {
  const { ws, isReady, WSParams, setLoadingState } = useContext(WSContext);

  return (pageName, params) => {
    if (!ws || !isReady) return;

    setLoadingState(prev => ({
      ...prev,
      [PageNames[pageName]]: true,
    }));
    WSParams.current = params;
    ws.send(JSON.stringify({ data: { page: pageName, ...params } }));
  };
}
