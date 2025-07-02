import { useEffect, useImperativeHandle, useState } from "react";
import style from "./ImageLoader.module.scss";
import Icon from "../Icon/Icon";
import classNames from "classnames";
import { heicTo } from "heic-to";

import imageCompression from "browser-image-compression";

export default function ImageLoader({ isLoading = false, fileUrl, setFile, loaderRef, onClear }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useImperativeHandle(
    loaderRef,
    () => ({
      clear: () => {
        setPreviewUrl(null);
        setFileType(null);
      },
    }),
    [],
  );

  useEffect(() => {
    if (!fileUrl) return;
    setPreviewUrl(fileUrl);
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    setFileType(ext === "pdf" ? "pdf" : "image");
  }, [fileUrl]);

  const processFile = async file => {
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    if (isPdf) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileType("pdf");
      setFile(file);
      return;
    }
    setIsCompressing(true);
    setFileType("image");

    let imageFile = file;
    const isHeic = /(\.heic|\.heif)$/i.test(imageFile.name) || /image\/hei(c|f)/.test(imageFile.type);

    if (isHeic) {
      try {
        const jpegBlob = await heicTo({
          blob: imageFile,
          toType: "image/jpeg",
          quality: 0.9,
        });

        imageFile = new File([jpegBlob], imageFile.name.replace(/(\.heic|\.heif)$/i, ".jpg"), {
          type: "image/jpeg",
        });
      } catch (e) {
        console.error("Не удалось конвертировать HEIC.", e);
        setIsCompressing(false);
        return;
      }
    }

    const options = {
      maxSizeMB: 0.55,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);
      const objectUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(objectUrl);
      setFile(compressedFile);
    } catch (error) {
      console.error("Ошибка сжатия изображения:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleChange = e => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const onDrop = e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onDragOver = e => e.preventDefault();

  const clearFile = () => {
    onClear && onClear();
    setPreviewUrl(null);
    setFile(null);
    setFileType(null);
  };

  const renderPreview = () => {
    if (fileType === "pdf") {
      return (
        <div className={style.pdf}>
          <embed src={previewUrl} type="application/pdf" width="100%" height="100%" />
          <button onClick={clearFile}>
            <Icon width={24} name="cross" />
          </button>
        </div>
      );
    }

    return (
      <div className={style.image}>
        <img src={previewUrl} onError={clearFile} />
        <button onClick={clearFile}>
          <Icon width={24} name="cross" />
        </button>
      </div>
    );
  };

  return (
    <div className={style.overlay}>
      {isCompressing || isLoading ? (
        <div className={style.loaderWrapper}>
          <span className={style.loader}></span>
          <p>Загрузка...</p>
        </div>
      ) : previewUrl ? (
        renderPreview()
      ) : (
        <label
          onDrop={onDrop}
          onDragOver={onDragOver}
          className={classNames(style.label, {
            [style.labelWithLoader]: isLoading,
          })}>
          <input className={style.input} type="file" accept="image/*,.pdf" onChange={handleChange} />
          <span className={style.loadDescr}>
            Загрузить фото или PDF
            <Icon name="camera" width={24} />
          </span>
          <p className={style.actionDescr}>
            Перетащите изображение или PDF в это поле или воспользуйтесь кнопкой загрузки
          </p>
        </label>
      )}
    </div>
  );
}
