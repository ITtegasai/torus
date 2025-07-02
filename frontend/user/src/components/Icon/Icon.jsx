import Icons from "../../assets/icons/sprite.svg";


function Icon({ color = 'none', name , width, height = width, ...props }) {
  return (
    <svg {...props} fill={color} width={width} height={height}>
      <use href={`${Icons}#${name}`} />
    </svg>
  );
}

export default Icon;
