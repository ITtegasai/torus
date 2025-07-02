import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

const main = axios.create({
  baseURL: import.meta.env.VITE_MAIN_URL,
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
    "x-service-auth-key": import.meta.env.VITE_AUTH_TOKEN,
  },
});

const getToken = () => {
  const token = cookies.get("token");
  if (!token) throw new Error("Отсутствует токен");
  return token;
};

export const acceptVerification = async user_uid => {
  const token = getToken();
  const { data } = await main.post(
    `/acceptverification/${token}`,
    {},
    {
      params: { user_uid },
    },
  );
  return data;
};

export const getReceipt = async tx_hash => {
  const token = getToken();
  const { data } = await main.post(
    `/getreceipt/${token}`,
    {},
    {
      params: { tx_hash },
    },
  );
  return data;
};

export const getUserVerificationImages = async (type, uid) => {
  const token = getToken();
  const { data } = await main.post(
    `/getverificationimagesuser/${token}`,
    {},
    {
      params: { type, uid },
    },
  );
  return data;
};

export const confirmPurchase = async (tx_hash, status, amount) => {
  const token = getToken();
  const params = status !== 2 ? { tx_hash, status, amount } : { tx_hash, status };
  const { data } = await main.post(
    `/confirmpurchase/${token}`,
    {},
    {
      params,
    },
  );
  return data;
};

export const withdrawBonuses = async (tx_hash, status) => {
  const token = getToken();
  const { data } = await main.post(
    `/confirmwithdraw/${token}`,
    {},
    {
      params: { tx_hash, status },
    },
  );
  return data;
};

/*
user_uid - uid пользователя кому начислить бонус
amount - сумма
buy_type - тип бонуса (0 - покупка акции, 1 - покупка за сумму, 2 - покупка пакета, 3 - рассрочка)
type_bonus - (true - с бонусами, false - без бонусов)
*/
export const addShares = async (user_uid, amount, type_bonus, packageId) => {
  const token = getToken();
  const { data } = await main.post(
    `/manualbonus/${token}`,
    {},
    {
      params: {
        user_uid,
        amount,
        buy_type: 0,
        type_bonus,
        package_id: packageId,
      },
    },
  );
  return data;
};

export const updateUser = async (user_uid, newData) => {
  const token = getToken();
  const { data } = await main.post(
    `/updateuserdataadmin`,
    // {},
    {
      access_token: token,
      table: "users",
      uid: user_uid,
      data: newData,
    },
  );
  return data;
};
