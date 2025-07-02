import React, { Suspense } from "react";
import Loader from "./components/Loader/Loader";
import Partnership from "./pages/Partnership";
import Offer from "./pages/Offer";
import Vacancy from "./pages/Vacancy";
import ChangePassCode from "./pages/ChangePassCode";
import ChangePass from "./pages/ChangePass";

// Ленивая загрузка компонентов
const Main = React.lazy(() => import("./pages/Main"));
const Ecliptics = React.lazy(() => import("./pages/Ecliptics"));
const About = React.lazy(() => import("./pages/About"));
const FinancesAcount = React.lazy(() => import("./pages/Finances/FinancesAcount"));
const FinancesBonuses = React.lazy(() => import("./pages/Finances/FinancesBonuses"));
const ForgotPass = React.lazy(() => import("./pages/ForgotPass"));
const LogIn = React.lazy(() => import("./pages/Login"));
const News = React.lazy(() => import("./pages/News/News"));
const OneNew = React.lazy(() => import("./pages/OneNew/OneNew"));
const Personal = React.lazy(() => import("./pages/Personal"));
const Profile = React.lazy(() => import("./pages/Profile/Profile"));
const ProfileVerification = React.lazy(() => import("./pages/Profile/ProfileVerification"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const Structure = React.lazy(() => import("./pages/Structure"));
const VerificationEmail = React.lazy(() => import("./pages/VerificationEmail"));
const Investment = React.lazy(() => import("./pages/Investment"));

// Функция-обёртка для компонентов с Suspense
const withSuspense = Component => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

export const links = [
  {
    title: "Главная",
    path: "/main",
    icon: "house",
    visible: true,
    component: withSuspense(Main),
    private: true,
  },
  {
    title: "Эклиптикс",
    path: "/ecliptics",
    icon: "rocket",
    visible: true,
    component: withSuspense(Ecliptics),
    private: true,
  },
  {
    title: "Торус Групп",
    path: "/room",
    icon: "rocket",
    visible: true,
    component: withSuspense(Personal),
    private: true,
  },
  {
    title: "О компании",
    path: "/about",
    icon: "statistics",
    visible: true,
    component: withSuspense(About),
    private: true,
  },
  {
    title: "Профиль",
    path: "/profile",
    icon: "profile",
    visible: true,
    component: withSuspense(Profile),
    private: true,
  },
  {
    title: "Профиль",
    path: "/profile/verification",
    icon: "profile",
    visible: false,
    component: withSuspense(ProfileVerification),
    private: true,
  },
  {
    title: "Финансы",
    path: "/finances",
    icon: "money-case",
    visible: true,
    component: withSuspense(FinancesAcount),
    private: true,
  },
  {
    title: "Финансы",
    path: "/finances/bonuses",
    icon: "money-case",
    visible: false,
    component: withSuspense(FinancesBonuses),
    private: true,
    isLo: true,
  },
  {
    title: "Кабинет консультанта",
    path: "/structure",
    icon: "chart",
    visible: true,
    component: withSuspense(Structure),
    private: true,
    isLo: true,
  },
  {
    title: "Вакансии",
    path: "/vacancy",
    icon: "time-case",
    visible: true,
    component: withSuspense(Vacancy),
    private: true,
  },
  // {
  //   title: "Новости",
  //   path: "/news",
  //   icon: "news",
  //   visible: true,
  //   component: withSuspense(News),
  //   private: true,
  // },
  {
    title: "Новости",
    path: "/news/:id",
    icon: "news",
    visible: false,
    component: withSuspense(OneNew),
    private: true,
  },
  {
    title: "Партнерская программа",
    path: "/partnership",
    icon: "users",
    visible: true,
    component: withSuspense(Partnership),
    private: true,
  },
  {
    title: "Логин",
    path: "/login",
    icon: "",
    visible: false,
    component: withSuspense(LogIn),
    private: false,
  },
  {
    title: "Восстановление пароля",
    path: "/forgot-password",
    icon: "",
    visible: false,
    component: withSuspense(ForgotPass),
    private: false,
  },
  {
    title: "Подтверждение Email",
    path: "/email-confirmation",
    icon: "",
    visible: false,
    component: withSuspense(VerificationEmail),
    private: false,
  },
  {
    title: "Регистрация",
    path: "/sign-up",
    icon: "",
    visible: false,
    component: withSuspense(SignUp),
    private: false,
  },
  {
    title: "Торус Агро",
    path: "/investment",
    icon: "investment",
    visible: true,
    component: withSuspense(Investment),
    private: true,
  },
  {
    title: "Предложить проект",
    path: "/offer",
    icon: "folder",
    visible: true,
    component: withSuspense(Offer),
    private: true,
  },
  {
    title: "Подтверждение Email",
    path: "/change-pass-code",
    icon: "",
    visible: false,
    component: withSuspense(ChangePassCode),
    private: false,
  },
  {
    title: "Новый пароль",
    path: "/change-pass",
    icon: "",
    visible: false,
    component: withSuspense(ChangePass),
    private: false,
  },
];
