import axios from "axios";

const auth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
});

const headers = {
  accept: "application/json",
  "x-service-auth-key": import.meta.env.VITE_AUTH_TOKEN,
  "Content-Type": "application/json",
};

export async function registration({ login, email, password, referrer }) {
  const { data } = await auth.post(
    "/registration",
    {
      login,
      email,
      password,
      referrer
    },
    {
      headers,
    }
  );
  return data;
}

export async function login({ email, password }) {
  const { data } = await auth.post(
    "/login",
    {
      email,
      password,
    },
    {
      headers,
    }
  );
  return data;
}

export async function verification({ email, password, code }) {
  const { data } = await auth.post(
    "/verification",
    {
      email,
      password,
      code,
    },
    {
      headers,
    }
  );
  return data;
}

export async function getUserData({ access_token }) {
  const { data } = await auth.post(
    "/getdata",
    {
      access_token,
    },
    {
      headers,
    }
  );
  return data;
}

export async function checkValidCode({ email, code }) {
  const { data } = await auth.post(
    "/code2code",
    { email, code },
    {
      headers,
    }
  );
  return data;
}

export async function setNewPassword({ email, code, password }) {
  const { data } = await auth.post(
    "/verificationnewpassword",
    { email, code, password },
    {
      headers,
    }
  );
  return data;
}
