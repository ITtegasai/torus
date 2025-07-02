import { useContext } from "react";
import { WSContext } from "../context/WebSocketContext";

export default function useWSSend() {
  const { ws, isReady, WSParams } = useContext(WSContext);

  return (pageName, params) => {
    if (!ws || !isReady) return;

    WSParams.current = params;
    ws.send(JSON.stringify({ data: { page: pageName, ...params } }));
  };
}
