import React, { useEffect, useState } from 'react';

const ImageWithFallback = ({ src, alt, fallbackSrc, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  },[src])

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  return <img {...props} className={className} src={imgSrc} alt={alt} onError={handleError} />;
};

export default ImageWithFallback;