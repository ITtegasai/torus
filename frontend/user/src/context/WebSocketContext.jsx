import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { findAndAddChildren } from "../helpers/findAndAddChildren";

export const WSContext = createContext(null);

export default function WebSocketContext({ children }) {
  const [cookies] = useCookies();
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [bonuses, setBonuses] = useState(null);
  const [about, setAbout] = useState("");
  const [structure, setStructure] = useState([]);
  const [cabinet, setCabinet] = useState(null);
  const [main, setMain] = useState(null);
  const [news, setNews] = useState([]);
  const currentPage = useRef(null);
  const WSParams = useRef(null);
  const [structureVolumes, setStructureVolumes] = useState(null);
  const [structureQualifications, setStructureQualifications] = useState([]);
  const [structureData, setStructureData] = useState([]);

  const ws = useRef(null);
  const timerRef = useRef(null);
  const count = useRef(0);
  const showedInfoMess = useRef(false);

  const token = cookies.access_token || null;

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

  function createNodes(data) {
    return data.map(item => {
      return {
        id: item?.user?.id,
        image: `${import.meta.env.VITE_MAIN_URL}/images/${item?.user?.uid}.jpg`,
        name: item?.userData?.first_name || item?.user?.username,
        children: [],
        email: item?.user?.email,
        username: item?.user?.username,
        my_structure: item?.user?.my_structure,
        lo: item?.user?.lo,
        qualification: item?.user?.qualification,
      };
    });
  }

  const webSocketConnect = useCallback(() => {
    if (!token) return;

    let socket = new WebSocket(import.meta.env.VITE_MAIN_ROUTE_URI + "/" + token);

    socket.onopen = () => {
      console.log("opened");
      showedInfoMess.current = false;
      socket.send(JSON.stringify({ data: { page: "User" } }));
      setIsReady(true);
      clearTimer();
    };

    socket.onclose = ({ code }) => {
      console.log("WebSocket закрыт");
      if (code === 1000) {
        showedInfoMess.current = false;
        setIsReady(false);
        count.current = 0;
        clearTimer();
        window.location.reload();
        return;
      }

      setIsReady(false);

      if (count.current < 10) {
        timerRef.current = setTimeout(() => {
          count.current += 1;
          webSocketConnect();
        }, 1000);
      } else {
        showedInfoMess.current = false;
        // toast.error("Ошибка подключения, попробуйте позже");
        count.current = 0;
        clearTimer();
      }
    };

    socket.onerror = error => {
      if (!showedInfoMess.current) {
        // toast.error("Соединение отсутствует, пытаемся подключиться");
        showedInfoMess.current = true;
      }
      console.error("WebSocket ошибка:", error);
      setIsReady(false);
      socket.close();
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

          if (data?.message?.data?.page === "User") {
            setUser({ ...data.User.user, ...data.User.userData, lo: data?.User?.lo });
            if (!structure.length) {
              setStructure([
                {
                  name: data.User.userData.first_name,
                  y: 150,
                  image: `${import.meta.env.VITE_MAIN_URL}/images/${data.User.user.uid}.jpg`,
                  children: [],
                  username: data.User.user.username,
                  email: data.User.user.email,
                  my_structure: data.User.user.my_structure,
                  lo: data.User.user.lo,
                },
              ]);
            }
          }

          if (data?.message?.data?.page === "Cabinet") {
            setCabinet(data.Cabinet);
          }

          if (data?.message?.data?.page === "Main") {
            setMain(data.Main);
          }

          if (data?.message?.data?.page === "Finances") {
            console.log(data);
            setTransactions(data.Finances);
          }

          if (data?.message?.data?.page === "Bonuses") {
            console.log(data);
            setBonuses(data.Bonuses || []);
          }

          if (data?.message?.data?.page === "News") {
            console.log(data);
            const news = data.News.news;
            if (Array.isArray(news)) {
              setNews(data.News.news);
            } else {
              setNews([data.News.news]);
            }
          }

          if (data?.message?.data?.page === "About") {
            setAbout(data?.About?.text);
          }

          if (data?.message?.data?.page === "Structure") {
            setStructureVolumes(data.Structure.data);
            const struct = data.Structure.users;
            setStructureData(data.Structure.data);
            setStructureQualifications(data.Structure.qualifications);

            setStructure(prev => {
              if (!prev[0]?.children.length) {
                const user = prev[0];
                user.children = createNodes(struct);
                return [user];
              } else {
                const level = WSParams.current.level;
                const idx = WSParams.current.idx;
                return findAndAddChildren(prev, level, idx, createNodes(struct));
              }
            });
          }
      }
    };

    ws.current = socket;
  }, [token]);

  useEffect(() => {
    if (!token) return;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      return;
    }

    webSocketConnect();

    return () => {
      ws.current?.close();
      clearTimer();
    };
  }, [webSocketConnect, ws]);

  return (
    <WSContext.Provider
      value={{
        ws: ws.current,
        isReady,
        news,
        main,
        user,
        setUser,
        structureVolumes,
        cabinet,
        currentPage,
        transactions,
        bonuses,
        structure,
        setStructure,
        setTransactions,
        structureQualifications,
        structureData,
        about,
        WSParams,
      }}>
      {children}
    </WSContext.Provider>
  );
}
