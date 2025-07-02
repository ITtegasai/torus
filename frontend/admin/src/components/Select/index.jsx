import style from "./style.module.scss";

const Select = ({ onChange, options, value }) => {
  return (
    <select
      name="dropdown"
      className={style.customSelect}
      onChange={event => onChange(options.find(option => option.title === event.target.value).value)}>
      {options.map(option => (
        <option defaultValue={value == option.value} key={option.value}>
          {option.title}
        </option>
      ))}
    </select>
  );
};

export default Select;
