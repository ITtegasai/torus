import Icon from "../../../components/Icon";
import style from "../Users.module.scss";
import classNames from "classnames";

export default function UserActions({ user, openUserModal, acceptUserVerification }) {
  const isVerified = user.role > 0;
  return (
    <div className={style.actions}>
      <button
        disabled={isVerified}
        onClick={() => acceptUserVerification(user.uid)}
        className={classNames(style.acceptBtn, { [style.acceptBtn_active]: !isVerified })}>
        <Icon name="done" width={24} />
      </button>
      <button disabled={!isVerified} className={classNames(style.crossBtn, { [style.crossBtn_active]: isVerified })}>
        <Icon name="cross" width={24} />
      </button>
      <button
        disabled={!user.pending_verification && user.qualification === 0}
        onClick={() => openUserModal(user)}
        className={style.actionBtn}>
        <Icon name="pencil" width={24} />
      </button>
    </div>
  );
}
