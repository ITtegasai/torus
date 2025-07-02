export const initialFilterFieldsValue = {
  first_name: {
    id: "first_name",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "ФИО",
    placeholder: "ФИО",
  },
  reffer_login: {
    id: "reffer_login",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "Логин спонсора",
    placeholder: "Логин спонсора",
  },
  initiator_id: {
    id: "initiator_id",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "Логин инициатора",
    placeholder: "Логин инициатора",
  },
  qualification: {
    id: "qualification",
    variant: "select",
    prevValue: null,
    value: null,
    label: "Квалификация",
    placeholder: "Не выбран",
    options: [
      {
        title: "0",
        value: "0",
      },
      {
        title: "1",
        value: "1",
      },
      {
        title: "2",
        value: "2",
      },
      {
        title: "3",
        value: "3",
      },
      {
        title: "4",
        value: "4",
      },
      {
        title: "5",
        value: "5",
      },
      {
        title: "6",
        value: "6",
      },
      {
        title: "7",
        value: "7",
      },
    ],
  },
  status: {
    id: "status",
    variant: "select",
    prevValue: null,
    value: null,
    label: "Статус",
    placeholder: "Не выбран",
    options: [
      {
        title: "Не верифицирован",
        value: "0",
      },
      {
        title: "Ожидает подтверждения",
        value: "1",
      },
      {
        title: "Отклонен",
        value: "2",
      },
      {
        title: "Подтвержден",
        value: "3",
      },
    ],
  },
  dateGroup: {
    id: "dateGroup",
    group: true,
    fields: [
      {
        id: "dateFrom",
        variant: "input",
        type: "date",
        prevValue: "",
        value: "",
        label: "Дата (от)",
        placeholder: "",
      },
      {
        id: "dateTo",
        variant: "input",
        type: "date",
        prevValue: "",
        value: "",
        label: "Дата (до)",
        placeholder: "",
      },
    ],
  },
  type: {
    id: "type",
    variant: "select",
    prevValue: 0,
    value: 0,
    label: "Тип",
    placeholder: "Не выбран",
    options: [
      {
        title: "Торус Групп",
        value: 1,
      },
      {
        title: "Эклиптикс",
        value: 2,
      },
    ],
  },
  sort: {
    id: "sort",
    variant: "select",
    prevValue: 0,
    value: 0,
    label: "Сортировать от",
    placeholder: "Не выбран",
    options: [
      {
        title: "Новых к старым",
        value: 0,
      },
      {
        title: "Старых к новым",
        value: 1,
      },
    ],
  },
  email: {
    id: "email",
    variant: "input",
    type: "email",
    prevValue: "",
    value: "",
    label: "Email",
    placeholder: "Email",
  },
  username: {
    id: "username",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "Логин",
    placeholder: "Логин",
  },
  LOGroup: {
    id: "LOGroup",
    group: true,
    fields: [
      {
        id: "minLo",
        variant: "input",
        type: "number",
        prevValue: "",
        value: "",
        label: "ЛО (от)",
        placeholder: "0",
      },
      {
        id: "maxLo",
        variant: "input",
        type: "number",
        prevValue: "",
        value: "",
        label: "ЛО (до)",
        placeholder: "0",
      },
    ],
  },
  role: {
    id: "role",
    variant: "select",
    prevValue: null,
    value: null,
    label: "Роль",
    placeholder: "Не выбран",
    options: [
      {
        title: "Зарегистрирован",
        value: "0",
      },
      {
        title: "Верифицирован",
        value: "1",
      },
      {
        title: "Совершил покупку",
        value: "2",
      },
      {
        title: "Администратор",
        value: "3",
      },
    ],
  },
};

export const initialFilterAccountsValue = {
  first_name: {
    id: "first_name",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "ФИО",
    placeholder: "ФИО",
  },
  reffer_login: {
    id: "reffer_login",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "Логин спонсора",
    placeholder: "Логин спонсора",
  },
  initiator_id: {
    id: "initiator_id",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "Логин инициатора",
    placeholder: "Логин инициатора",
  },
  buy_type: {
    id: "buy_type",
    variant: "select",
    prevValue: null,
    value: null,
    label: "Описание",
    placeholder: "Не выбран",
    options: [
      {
        title: "Покупка акций",
        value: "0",
      },
      {
        title: "Покупка за сумму",
        value: "1",
      },
      {
        title: "Покупка пакета",
        value: "2",
      },
      {
        title: "Рассрочка",
        value: "3",
      },
    ],
  },
  status: {
    id: "status",
    variant: "select",
    prevValue: null,
    value: null,
    label: "Статус",
    placeholder: "Не выбран",
    options: [
      {
        title: "Cоздана",
        value: "0",
      },
      {
        title: "На проверке",
        value: "1",
      },
      {
        title: "Отклонена",
        value: "2",
      },
      {
        title: "Оплачена",
        value: "3",
      },
    ],
  },
  dateGroup: {
    id: "dateGroup",
    group: true,
    fields: [
      {
        id: "dateFrom",
        variant: "input",
        type: "date",
        prevValue: "",
        value: "",
        label: "Дата рег. (от)",
        placeholder: "",
      },
      {
        id: "dateTo",
        variant: "input",
        type: "date",
        prevValue: "",
        value: "",
        label: "Дата рег. (до)",
        placeholder: "",
      },
    ],
  },
  type: {
    id: "type",
    variant: "select",
    prevValue: 0,
    value: 0,
    label: "Тип",
    placeholder: "Не выбран",
    options: [
      {
        title: "Торус Групп",
        value: 1,
      },
      {
        title: "Эклиптикс",
        value: 2,
      },
    ],
  },
  sort: {
    id: "sort",
    variant: "select",
    prevValue: 0,
    value: 0,
    label: "Сортировать от",
    placeholder: "Не выбран",
    options: [
      {
        title: "Новых к старым",
        value: 0,
      },
      {
        title: "Старых к новым",
        value: 1,
      },
    ],
  },
  email: {
    id: "email",
    variant: "input",
    type: "email",
    prevValue: "",
    value: "",
    label: "Email",
    placeholder: "Email",
  },
  username: {
    id: "username",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "Логин",
    placeholder: "Логин",
  },
  LOGroup: {
    id: "LOGroup",
    group: true,
    fields: [
      {
        id: "minLo",
        variant: "input",
        type: "number",
        prevValue: "",
        value: "",
        label: "ЛО (от)",
        placeholder: "0",
      },
      {
        id: "maxLo",
        variant: "input",
        type: "number",
        prevValue: "",
        value: "",
        label: "ЛО (до)",
        placeholder: "0",
      },
    ],
  },
  role: {
    id: "role",
    variant: "select",
    prevValue: null,
    value: null,
    label: "Роль",
    placeholder: "Не выбран",
    options: [
      {
        title: "Зарегистрирован",
        value: "0",
      },
      {
        title: "Верифицирован",
        value: "1",
      },
      {
        title: "Совершил покупку",
        value: "2",
      },
      {
        title: "Администратор",
        value: "3",
      },
    ],
  },
};

export const initialFilterBonusesValue = {
  first_name: {
    id: "first_name",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "ФИО",
    placeholder: "ФИО",
  },
  reffer_login: {
    id: "reffer_login",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "Логин спонсора",
    placeholder: "Логин спонсора",
  },
  initiator_id: {
    id: "initiator_id",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "Логин инициатора",
    placeholder: "Логин инициатора",
  },
  bonus_type: {
    id: "bonus_type",
    variant: "select",
    prevValue: null,
    value: null,
    label: "Бонус",
    placeholder: "Не выбран",
    options: [
      {
        title: "Реферальный",
        value: "0",
      },
      {
        title: "Бонус личных продаж",
        value: "1",
      },
      {
        title: "Запрос на вывод",
        value: "2",
      },
    ],
  },
  status: {
    id: "status",
    variant: "select",
    prevValue: null,
    value: null,
    label: "Статус",
    placeholder: "Не выбран",
    options: [
      {
        title: "Cоздана",
        value: "0",
      },
      {
        title: "На проверке",
        value: "1",
      },
      {
        title: "Отклонена",
        value: "2",
      },
      {
        title: "Оплачена",
        value: "3",
      },
    ],
  },
  dateGroup: {
    id: "dateGroup",
    group: true,
    fields: [
      {
        id: "dateFrom",
        variant: "input",
        type: "date",
        prevValue: "",
        value: "",
        label: "Дата рег. (от)",
        placeholder: "",
      },
      {
        id: "dateTo",
        variant: "input",
        type: "date",
        prevValue: "",
        value: "",
        label: "Дата рег. (до)",
        placeholder: "",
      },
    ],
  },
  type: {
    id: "type",
    variant: "select",
    prevValue: 0,
    value: 0,
    label: "Тип",
    placeholder: "Не выбран",
    options: [
      {
        title: "Торус Групп",
        value: 1,
      },
      {
        title: "Эклиптикс",
        value: 2,
      },
    ],
  },
  sort: {
    id: "sort",
    variant: "select",
    prevValue: 0,
    value: 0,
    label: "Сортировать от",
    placeholder: "Не выбран",
    options: [
      {
        title: "Новых к старым",
        value: 0,
      },
      {
        title: "Старых к новым",
        value: 1,
      },
    ],
  },
  email: {
    id: "email",
    variant: "input",
    type: "email",
    prevValue: "",
    value: "",
    label: "Email",
    placeholder: "Email",
  },
  username: {
    id: "username",
    variant: "input",
    type: "text",
    prevValue: "",
    value: "",
    label: "Логин",
    placeholder: "Логин",
  },
  LOGroup: {
    id: "LOGroup",
    group: true,
    fields: [
      {
        id: "minLo",
        variant: "input",
        type: "number",
        prevValue: "",
        value: "",
        label: "ЛО (от)",
        placeholder: "0",
      },
      {
        id: "maxLo",
        variant: "input",
        type: "number",
        prevValue: "",
        value: "",
        label: "ЛО (до)",
        placeholder: "0",
      },
    ],
  },
  role: {
    id: "role",
    variant: "select",
    prevValue: null,
    value: null,
    label: "Роль",
    placeholder: "Не выбран",
    options: [
      {
        title: "Зарегистрирован",
        value: "0",
      },
      {
        title: "Верифицирован",
        value: "1",
      },
      {
        title: "Совершил покупку",
        value: "2",
      },
      {
        title: "Администратор",
        value: "3",
      },
    ],
  },
};
