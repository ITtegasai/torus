import { Link } from "react-router-dom";
import style from "./style.module.scss";
import Icon from "../../components/Icon/Icon";
import classNames from "classnames";
import LogoBlack from "../../components/LogoBlack/LogoBlack";

const nav = [
  {
    title: "Кабинет партнера",
    descr: "",
    image: "computer",
    link:'/room'
  },
  {
    title: "Верификация",
    descr:
      "Пройди верификацию, получи полный доступ к предложениям от компании.",
    image: "user-box",
    link:'/profile/verification'
  },
  {
    title: "Партнерская программа",
    descr:
      "Платим за рекомендацию. От вас зашел капитал в ТОРУС, с нас - вознаграждение.",
    image: "link-chain",
    link:'/partnership'
  },
  {
    title: "Новости",
    descr: "Узнай последние новости группы компаний ТОРУС",
    image: "news-paper",
    link:'/news'
  },
];

const socials = [
    {
        image: 'telegram',
        link:'https://t.me/TFGcompany'
    },
    // {
    //     image: 'youtube',
    //     link:'/'
    // },
    // {
    //     image: 'support',
    //     link:'/'
    // },
    // {
    //     image: 'rutube',
    //     link:'/'
    // },
    // {
    //     image: 'dzen',
    //     link:'/'
    // }
]

export default function Main() {
  return (
    <div className={style.container}>
      <div className={style.overlay}>
        <div className={style.main}>
          <Link to='/room' className={style.stocksProfit}>
            <h5>Доход от акций</h5>
            <p>
              Платишь за один бизнес, получаешь пять. Купи один раз акции и
              получай всю жизнь дивиденды.
            </p>
            <div className={style.linkBtn} to="/">
              <Icon name="arrow-line-right" width={28} />
            </div>
          </Link>
          <Link to='/about' className={style.aboutCompany}>
            <h5>О компании</h5>
            <p>
              Узнай всю актуальную информацию о группе компаний ТОРУС в одном
              месте.
            </p>
          </Link>
          <div className={style.nav}>
            {nav.map((item, i) => (
              <Link key={i} to={item.link} className={style.navItem}>
                <div className={style.navImage}>
                  <Icon name={item.image} width={26} />
                </div>
                <div className={style.navItemRight}>
                  <h5 className={style.navItemTitle}>{item.title}</h5>
                  <p className={style.navItemDescr}>{item.descr}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className={style.bottom}>
            <Link to='/vacancy' className={classNames(style.bottom__item, style.findJob)}>
              <h5>Устроится на работу</h5>
              <p>
                Собираем команду мечты. 30+ вакансий. Примени свои знания и
                навыки в масштабном проекте.
              </p>
            </Link>
            <Link to='/offer'
              className={classNames(style.bottom__item, style.offerBuisness)}
            >
              <h5>Предложить бизнес</h5>
              <p>
                У вас есть действующий бизнес? Предлагаем ресурсы для
                масштабирования.
              </p>
            </Link>
            <Link to='/investment' className={classNames(style.bottom__item, style.investment)}>
              <h5>Инвестиции</h5>
              <p>Инвестируй в торговлю с/х продукцией, получи 40% годовых</p>
              <span>
                * не является офертой, результаты работы по итогу 2023 года
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className={style.footer}>
            <LogoBlack width={84} height={52}/>
            <div className={style.socials}>
                {socials.map((social,i) => <Link key={i} className={style.socials__item} to={social.link}>
                    <Icon name={social.image} width={21}/>
                </Link>)}
            </div>
      </div>
    </div>
  );
}
