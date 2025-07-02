import LeftSideMenu from "./components/LeftSideMenu";
import style from "./App.module.scss";
import { Route, Routes } from "react-router-dom";
import Users from "./pages/Users";
import Bonuses from "./pages/Bonuses";
import Accounts from "./pages/Accounts";
import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <div className={style.app}>
      <LeftSideMenu />
      <div className={style.layout}>
        <Routes>
          <Route path="/" element={<Users title={"Пользователи"} />} />
          <Route path="/bonuses" element={<Bonuses title={"Бонусы"} />} />
          <Route path="/accounts" element={<Accounts title={"Счета"} />} />
        </Routes>
      </div>
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}
