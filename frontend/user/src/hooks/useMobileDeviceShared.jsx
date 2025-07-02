const useIsMobileShare = () => {
  return !!navigator.share;
};

export default useIsMobileShare;
