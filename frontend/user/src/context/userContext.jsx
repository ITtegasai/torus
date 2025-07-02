import { createContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { getUserData } from "../api/auth";
import { catchError } from "../api/catchError";
import Loader from "../components/Loader/Loader";

export const userContext = createContext(null);

export default function UserDataContext({ children }) {
  const [cookies,_, removeCookie] = useCookies();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const access_token = cookies?.access_token;

  const getData = async () => {
    try {
      setIsLoading(true);
      const user = await getUserData({ access_token: access_token });
      setUser(user.result);
    } catch (e) {
      if(e?.response?.data?.detail === "Invalid token2"){
        alert('Токен устарел')
        setUser(null)
        removeCookie('access_token')
      }
      catchError(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (access_token && !user) {
      getData();
    }
  }, [access_token]);

  return (
    <userContext.Provider value={[user, setUser]}>
      {isLoading && <Loader />}
      {children}
    </userContext.Provider>
  );
}
