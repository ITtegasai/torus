import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.scss";
import { CookiesProvider } from "react-cookie";
import { BrowserRouter } from "react-router-dom";
import WebSocketContext from "./context/WebSocketContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <>
    <ToastContainer />
    <BrowserRouter future={{ v7_startTransition: true }}>
      <WebSocketContext>
        <CookiesProvider>
          <App />
        </CookiesProvider>
      </WebSocketContext>
    </BrowserRouter>
  </>,
);
