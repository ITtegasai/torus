export const LoadFileBase64 = async (file) => {
  return await fetch(new URL(file, import.meta.url))
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      const byteArray = new Uint8Array(buffer);
      const binaryString = String.fromCharCode(...byteArray);
      return btoa(binaryString);
    });
};
