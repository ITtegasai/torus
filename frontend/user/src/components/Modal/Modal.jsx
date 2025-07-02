import React, { useImperativeHandle, useState } from "react";
import { createPortal } from "react-dom";
import style from "./Modal.module.scss";
import Icon from "../Icon/Icon";
import classNames from "classnames";

export default function Modal({
  modalRef,
  children,
  canClose = true,
  onClose,
  onOpen,
  onOverlayClick,
  position='center',
  big,
  ...props
}) {
  const [open, setOpen] = useState(false);

  useImperativeHandle(
    modalRef,
    () => ({
      open: () => {
        setOpen(true);
        onOpen && onOpen();
      },
      close: (flag = true) => {
        setOpen(false);
        flag && onClose && onClose();
      },
    }),
    [onOpen, onClose]
  );

  const onOverlay = (e) => {
    if (e.target !== e.currentTarget) return;
    onOverlayClick && onOverlayClick();
    onClose && onClose();
    modalRef?.current?.close();
  };

  return createPortal(
    <div
      {...props}
      className={classNames(style.overlay, { [style.openModal]: open, [style.overlay_right]: position === 'right' })}
    >
      <div onClick={onOverlay} className={style.modalContainer}>
        <div className={classNames(style.modal, {[style.modal_big]: big})}>
          <button
            onClick={() => modalRef.current.close()}
            className={style.btnClose}
          >
            <Icon name="cross" width={26} />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
