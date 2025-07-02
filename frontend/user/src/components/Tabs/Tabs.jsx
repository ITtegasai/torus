import classNames from 'classnames'
import style from './Tabs.module.scss'
import { Link } from 'react-router-dom'

export default function Tabs({tabs}) {
  return (
    <div className={style.tabs}>
        {tabs.map((tab,i) => {
            return tab.link 
            ?  <Link key={i} className={classNames(style.tab, style.otherTab)} to={tab.link}>{tab.title}</Link>   
            : <div key={i} className={classNames(style.tab, style.currentTab)}>{tab.title}</div>
        })}
    </div>
  )
}
