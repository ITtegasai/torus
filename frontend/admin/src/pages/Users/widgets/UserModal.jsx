import Modal from "../../../components/Modal";
import UserInfoForm from "./UserForm";
import style from "../Users.module.scss";
export default function UserModal({ modalRef, user, onClose }) {
  return (
    <Modal modalRef={modalRef} onClose={onClose}>
      <h4 className={style.modalTitle}>Просмотр данных</h4>
      <UserInfoForm user={user} modalRef={modalRef} />
    </Modal>
  );
}
