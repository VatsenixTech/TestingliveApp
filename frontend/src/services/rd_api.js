const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const readJsonResponse = async (response) => {
  const contentType = response.headers.get("content-type");

  const payload = contentType?.includes("application/json")
    ? await response.json()
    : {
        success: false,
        message: await response.text(),
      };

  if (!response.ok) {
    throw new Error(
      payload.message ||
        payload.error ||
        `Request failed with status ${response.status}`
    );
  }

  return payload;
};

export const applyCouponApi = async ({ candidateId, code }) => {
  const response = await fetch(`${API_URL}/coupons/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      candidateId,
      code,
    }),
  });

  return readJsonResponse(response);
};

export const getReferralApi = async (candidateId) => {
  const params = new URLSearchParams({
    candidateId,
  });

  const response = await fetch(
    `${API_URL}/referrals/me?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return readJsonResponse(response);
};