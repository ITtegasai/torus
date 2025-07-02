import axios from "axios";

const main = axios.create({
  baseURL: import.meta.env.VITE_MAIN_URL,
});

const headerWithFormData = {
  accept: "application/json",
  "x-service-auth-key": import.meta.env.VITE_AUTH_TOKEN,
  "Content-Type": "multipart/form-data",
};

const headers = {
  accept: "application/json",
  "x-service-auth-key": import.meta.env.VITE_AUTH_TOKEN,
  "Content-Type": "application/json",
};

export async function updateImage(token, formData) {
  if (!token) return;

  const { data } = await main.post(`/updateimage/${token}`, formData, {
    headers: headerWithFormData,
  });

  return data;
}

export async function updateUserData(access_token, table, data) {
  if (!access_token) return;

  const response = await main.post(
    "/updateuserdata",
    {
      access_token,
      table,
      data,
    },
    {
      headers,
    }
  );

  return response.data;
}

export async function getVirificationImages(access_token) {
  if (!access_token) return;

  const { data } = await main.post(
    `/getverificationimages/${access_token}`,
    {},
    {
      headers,
    }
  );

  return data;
}

export async function uploadVirificationImages(access_token, formData) {
  if (!access_token) return;

  const { data } = await main.post(
    `/uploadverificationimages/${access_token}`,
    formData,
    {
      headers: headerWithFormData,
    }
  );

  return data;
}

export async function buy(access_token, count, amount, type, package_id = 1) {
  if (!access_token) return;

  const { data } = await main.post(
    `/buy/${access_token}?amount=${amount}&package_id=${package_id}&count=${count}&type=${type}`,
    {},
    {
      headers: headers,
    }
  );

  return data;
}

export async function getDocs(
  access_token,
  count,
  amount,
  type,
  package_id = 1
) {
  if (!access_token) return;

  const { data } = await main.post(
    `/getdoc/${access_token}?amount=${amount}&package_id=${package_id}&count=${count}&type=${type}`,
    {},
    {
      headers: headers,
    }
  );

  return data;
}

export async function getDogovor(access_token, hash) {
  const { data } = await main.get(`/getdogovor/${access_token}`, {
    responseType:'blob',
    params: {
      hash
    },
    headers,
  });

  return data;
}

export async function sendReceipt(access_token, tx_hash, formData) {
  if (!access_token) return;

  const { data } = await main.post(
    `/sendreceipt/${access_token}?tx_hash=${tx_hash}`,
    formData,
    {
      headers: headerWithFormData,
    }
  );

  return data;
}

export async function cancelReceipt(access_token, tx_hash) {
  if (!access_token) return;

  const { data } = await main.post(
    `/cancelinvoice/${access_token}?tx_hash=${tx_hash}`,
    {},
    {
      headers,
    }
  );

  return data;
}

export async function acceptAgent(access_token) {
  if (!access_token) return;

  const { data } = await main.post(
    `/acceptagent/${access_token}`,
    {},
    {
      headers,
    }
  );

  return data;
}

export async function withdrawBonuses(access_token, typewd) {
  if (!access_token) return;

  const { data } = await main.post(
    `/withdraw/${access_token}`,
    {},
    {
      headers,
      params: {
        typewd,
      },
    }
  );

  return data;
}
