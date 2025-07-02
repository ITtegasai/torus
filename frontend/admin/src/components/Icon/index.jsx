import sprite from "../../assets/icons/sprite.svg";

export default function Icon({ name, width, height = width, ...props }) {
  return (
    <svg {...props} width={width} height={height}>
      <use href={`${sprite}#icon__${name}`} />
    </svg>
  );
}
