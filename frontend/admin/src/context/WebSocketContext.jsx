import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import Button from "../components/Button";
import { useNavigate, useLocation } from "react-router-dom";

export const WSContext = createContext(null);

export const PageNames = {
  User: "User",
  Users: "Users",
  Invoices: "Invoices",
};

export default function WebSocketContext({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies(["token"]);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState(null);
  const [bonuses, setBonuses] = useState(null);
  const currentPage = useRef(null);
  const WSParams = useRef(null);
  const [loadingState, setLoadingState] = useState({
    [PageNames.User]: false,
    [PageNames.Users]: false,
    [PageNames.Invoices]: false,
  });

  const ws = useRef(null);
  const timerRef = useRef(null);
  const count = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access_token = params.get("token");

    if (access_token) {
      setCookie("token", access_token, { maxAge: 86400 });
      params.delete("token");
      navigate({ search: params.toString() }, { replace: true });
    }
  }, []);

  const token = cookie.token || null;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  function parseData(data) {
    try {
      const parsedData = JSON.parse(data);
      return parsedData;
    } catch (error) {
      return data;
    }
  }

  const webSocketConnect = useCallback(() => {
    if (!token) return <div>Permission denied</div>;

    let socket = new WebSocket(import.meta.env.VITE_MAIN_ROUTE_URI + "/" + token);

    socket.onopen = () => {
      console.log("opened");
      socket.send(JSON.stringify({ data: { page: PageNames.User } }));
      setIsReady(true);
      clearTimer();
    };

    socket.onclose = ({ code }) => {
      console.log("WebSocket закрыт");
      if (code === 1000) {
        setIsReady(false);
        count.current = 0;
        clearTimer();
        // window.location.reload();
        return;
      }

      setIsReady(false);

      if (count.current < 10 && token) {
        timerRef.current = setTimeout(() => {
          count.current += 1;
          webSocketConnect();
        }, 1000);
      } else {
        toast.error("Ошибка подключения, попробуйте позже");
        count.current = 0;
        clearTimer();
      }
    };

    socket.onerror = error => {
      setIsReady(false);
      socket.close();
      console.error("WebSocket ошибка:", error);
    };

    socket.onmessage = event => {
      const type = event.type;

      switch (type) {
        case "message":
          const data = parseData(event.data);

          if (data === "update" && currentPage.current) {
            socket.send(
              JSON.stringify({
                data: { page: currentPage?.current, ...WSParams?.current },
              }),
            );
          }

          if (data?.message?.data?.page === PageNames.User) {
            setUser({ ...data.User.user, ...data.User.userData });
            setLoadingState(prev => ({
              ...prev,
              [PageNames.User]: false,
            }));
          }

          if (data?.message?.data?.page === PageNames.Users) {
            setUsers(data.Users);
            setLoadingState(prev => ({
              ...prev,
              [PageNames.Users]: false,
            }));
          }

          if (data?.message?.data?.page === PageNames.Invoices) {
            const newData = data?.Invoices || {};

            setLoadingState(prev => ({
              ...prev,
              [PageNames.Invoices]: false,
            }));

            if (data.message.data.tx_type == 1) {
              setBonuses(newData);
              return;
            }

            setTransactions(newData);
          }
      }
    };

    ws.current = socket;
  }, [token]);

  useEffect(() => {
    if (!token) {
      console.log("Токен отсутствует");
      ws.current?.close(1000);
      clearTimer();
      setIsReady(false);
      return;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      return;
    }

    webSocketConnect();

    return () => {
      ws.current?.close(1000);
      clearTimer();
    };
  }, [webSocketConnect, token]);

  return (
    <WSContext.Provider
      value={{
        ws: ws.current,
        isReady,
        users,
        setUsers,
        currentPage,
        transactions,
        bonuses,
        WSParams,
        loadingState,
        setLoadingState,
      }}>
      {!token ? (
        <div className="permission">
          <div>Permission denied</div>
          <Button href={import.meta.env.VITE_USER_FRONT_URL} target="_blank" type="a" variant="primary">
            Авторизоваться
          </Button>
        </div>
      ) : token && !user ? (
        <div className="permission">
          <div>Loading...</div>
          <Button onClick={() => window.location.reload()}>Обновить страницу</Button>
        </div>
      ) : (
        children
      )}
    </WSContext.Provider>
  );
}
