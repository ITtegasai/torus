import axios from "axios";

const auth = axios.create({
  baseURL: import.meta.env.VITE_VERIFICATION_CODE_URL,
});

const headers = {
  accept: "application/json",
  "x-service-auth-key": import.meta.env.VITE_VERIFICATION_CODE_TOKEN,
  "Content-Type": "application/json",
};

export async function checkEmailVerification(email) {
    const { data } = await auth.post(
      "/sendverificationcode",
      {
        email,
      },
      {
        headers,
      }
    );
    return data;
}


export async function checkEmailVerificationChangePass({ email }) {
  const { data } = await auth.post(
    "/sendverificationcodechangepassword",
    {
      email,
    },
    {
      headers,
    }
  );
  return data;
}