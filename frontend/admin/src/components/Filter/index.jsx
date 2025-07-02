import React, { useCallback, useState } from "react";
import Input from "../Input";
import Button from "../Button";
import style from "./style.module.scss";
import CustomSelect from "../CustomSelect";

export default function Filter({ initialFilterFieldsValue, pageName, setFilter }) {
  const [formData, setFormData] = useState(initialFilterFieldsValue);
  const [btnDisbaled, setDisabled] = useState(true);

  const onChange = useCallback(e => {
    const { value, name } = e.target;

    setFormData(prev => {
      const newFilterValue = { ...prev };

      let fieldFound = false;
      Object.keys(newFilterValue).forEach(key => {
        if (newFilterValue[key].group) {
          const fieldIndex = newFilterValue[key].fields.findIndex(field => {
            return field.id === name;
          });

          if (fieldIndex !== -1) {
            newFilterValue[key].fields[fieldIndex].value = value;
            fieldFound = true;
          }
        }
      });

      setDisabled(false);

      if (!fieldFound && newFilterValue[name]) {
        newFilterValue[name].value = value;
      }

      return newFilterValue;
    });
  }, []);

  const onSelect = (value, name) => {
    setFormData(prev => {
      const newFilterValue = { ...prev };

      let fieldFound = false;
      Object.keys(newFilterValue).forEach(key => {
        if (newFilterValue[key].group) {
          const fieldIndex = newFilterValue[key].fields.findIndex(field => field.id === name);
          if (fieldIndex !== -1) {
            newFilterValue[key].fields[fieldIndex].value = value;
            fieldFound = true;
          }
        }
      });

      if (!fieldFound && newFilterValue[name]) {
        newFilterValue[name].value = value;
        setDisabled(false);
      }

      return newFilterValue;
    });
  };

  const clearField = filter => {
    if (filter.type === "select") {
      filter.value = null;
      filter.prevValue = null;
    }

    filter.value = "";
    filter.prevValue = "";
  };

  const cancel = () => {
    setFormData(prev => {
      const newFilterValue = { ...prev };
      Object.keys(newFilterValue).forEach(key => {
        if (newFilterValue[key].group) {
          newFilterValue[key].fields.forEach(field => {
            clearField(field);
          });
          return;
        }
        clearField(newFilterValue[key]);
      });

      return newFilterValue;
    });

    setFilter("");
  };

  const onSubmit = () => {
    const collectedData = {};

    Object.keys(formData).forEach(key => {
      if (formData[key].group) {
        formData[key].fields.forEach(field => {
          collectedData[field.id] = field.value;
        });
      } else {
        collectedData[formData[key].id] = formData[key].value;
      }
    });

    setDisabled(true);

    setFilter({
      [pageName]: Object.fromEntries(
        Object.keys(initialFilterFieldsValue).flatMap(key => {
          const field = initialFilterFieldsValue[key];

          if (field.group && Array.isArray(field.fields)) {
            return field.fields.filter(subField => subField.value).map(subField => [subField.id, subField.value]);
          }

          return field.value ? [[field.id, field.value]] : [];
        }),
      ),
    });
  };

  return (
    <>
      <div className={style.container}>
        {Object.values(formData).map(filter => {
          if (filter.group) {
            return (
              <div key={filter.id} className={style.groupContainer}>
                {filter.fields.map(field => (
                  <Input
                    key={field.id}
                    label={field.label}
                    placeholder={field.placeholder}
                    type={field.type}
                    name={field.id}
                    value={field.value}
                    onChange={onChange}
                  />
                ))}
              </div>
            );
          }

          return filter.variant === "input" ? (
            <Input
              key={filter.id}
              label={filter.label}
              placeholder={filter.placeholder}
              type={filter.type}
              name={filter.id}
              value={filter.value}
              onChange={onChange}
            />
          ) : (
            <div className={style.select} key={filter.id}>
              <p className={style.select__label}>{filter.label}</p>
              <CustomSelect
                name={filter.id}
                onChoose={onSelect}
                title={filter.placeholder}
                options={filter.options}
                initial={filter.value}
              />
            </div>
          );
        })}
      </div>
      <div className={style.btns}>
        <Button disabled={btnDisbaled} onClick={onSubmit} variant="primary">
          Применить
        </Button>
        <Button onClick={cancel} variant="secondary">
          Сбросить
        </Button>
      </div>
    </>
  );
}
