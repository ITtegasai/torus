import { useState } from 'react'
import Button from '../Button/Button'
import style from './VerificationNotification.module.scss'
import classNames from 'classnames'
import { useNavigate, useNavigation } from 'react-router-dom'

export default function VerificationNotification({isVisible, setVisible}) {
    const nav = useNavigate()
  return (
    <div className={classNames(style.verification, {[style.verificationClosed] : !isVisible})}>
      <p className={style.description}>Пройдите верификацию в личном кабинете</p>
      <div className={style.btnGroup}>
        <Button onClick={() => nav('/profile/verification')} type='outlined'>Пройти сейчас</Button>
        <Button onClick={() =>setVisible(false)} type='secondary'>Пройти позже</Button>
      </div>
    </div>
  )
}
