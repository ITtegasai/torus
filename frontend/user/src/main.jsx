import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.scss";
import { CookiesProvider } from "react-cookie";
import { BrowserRouter } from "react-router-dom";
import UserDataContext from "./context/userContext.jsx";
import WebSocketContext from "./context/WebSocketContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <UserDataContext>
    <ToastContainer />
    <WebSocketContext>
      <BrowserRouter>
        <CookiesProvider>
          <App />
        </CookiesProvider>
      </BrowserRouter>
    </WebSocketContext>
  </UserDataContext>
);
