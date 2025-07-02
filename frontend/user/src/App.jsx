import { Routes, Route } from "react-router-dom";
import { NoMatchPage } from "./pages/NoMatchPage";
import Overlay from "./components/Overlay/Overlay";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import { links } from "./routes.jsx";
import NonPrivateOverlay from "./components/NonPrivateOverlay/NonPrivateOverlay.jsx";
import Default from "./pages/Default/Default.jsx";
import { useCookies } from "react-cookie";

function App() {
  const [cookies, setCookie] = useCookies(["access_token"]);
  const isAuthenticated = Boolean(cookies?.access_token?.length);

  return (
    <Routes>
      {links.map((link, i) => {
        return link.private ? (
          <Route
            key={i}
            path={link.path}
            element={
              <PrivateRoute component={<Overlay>{link.component}</Overlay>} />
            }
          />
        ) : (
          <Route
            key={i}
            path={link.path}
            element={<NonPrivateOverlay>{link.component}</NonPrivateOverlay>}
          />
        );
      })}
      <Route path={"/"} element={<Default />} />
      <Route path="*" element={<NoMatchPage />} />
    </Routes>
  );
}

export default App;
