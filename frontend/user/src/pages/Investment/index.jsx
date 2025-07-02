import React, { useEffect, useState } from 'react';

export default function Investment() {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    fetch('/invst.html')
      .then((response) => response.text())
      .then((html) => setHtmlContent(html))
      .catch((error) => console.error('Error loading HTML:', error));
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }}></div>
  );
}
