const RAW_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/*
  Normalize the API URL.

  These values will all become:
  http://localhost:5000/api

  http://localhost:5000
  http://localhost:5000/
  http://localhost:5000/api
  http://localhost:5000/api/
*/
function normalizeApiUrl(value) {
  const cleaned = String(value || "")
    .trim()
    .replace(/\/+$/, "");

  if (!cleaned) {
    return "http://localhost:5000/api";
  }

  if (cleaned.endsWith("/api")) {
    return cleaned;
  }

  return `${cleaned}/api`;
}

const API_BASE_URL = normalizeApiUrl(RAW_API_URL);

console.log("PROFILE API BASE URL:", API_BASE_URL);

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("candidateToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

async function request(path, options = {}) {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const url = `${API_BASE_URL}${normalizedPath}`;
  const token = getToken();

  console.log("PROFILE API REQUEST:", {
    method: options.method || "GET",
    url,
  });

  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,

    headers: {
      ...(isFormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    data = {
      message:
        text ||
        `Request failed with status ${response.status}`,
    };
  }

  if (!response.ok) {
    console.error("PROFILE API ERROR:", {
      status: response.status,
      url,
      data,
    });

    throw new Error(
      data.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

/* Load profile */

export function getProfile(candidateId) {
  if (!candidateId) {
    return Promise.reject(
      new Error("Candidate ID is required")
    );
  }

  return request(
    `/candidate-profile/${encodeURIComponent(candidateId)}`
  );
}

/* Update profile */

export function updateProfile(candidateId, values) {
  if (!candidateId) {
    return Promise.reject(
      new Error("Candidate ID is required")
    );
  }

  return request(
    `/candidate-profile/${encodeURIComponent(candidateId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(values),
    }
  );
}

/* Upload document */

export function uploadDocument(
  candidateId,
  file,
  docType
) {
  if (!candidateId) {
    return Promise.reject(
      new Error("Candidate ID is required")
    );
  }

  if (!file) {
    return Promise.reject(
      new Error("Please choose a file")
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("docType", docType);
  formData.append("consentAccepted", "true");

  formData.append(
    "consentText",
    "I confirm that this document belongs to me and authorize NoPromptJobs to process it for verification."
  );

  return request(
    `/candidate-profile/${encodeURIComponent(
      candidateId
    )}/upload-document`,
    {
      method: "POST",
      body: formData,
    }
  );
}

/* Delete document */

export function deleteDocument(
  candidateId,
  documentId
) {
  if (!candidateId || !documentId) {
    return Promise.reject(
      new Error(
        "Candidate ID and document ID are required"
      )
    );
  }

  return request(
    `/candidate-profile/${encodeURIComponent(
      candidateId
    )}/document/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
    }
  );
}

/* Email verification */

export function sendEmailOtp() {
  return request("/profile-verification/email/send", {
    method: "POST",
  });
}

export function verifyEmailOtp(code) {
  return request("/profile-verification/email/verify", {
    method: "POST",

    body: JSON.stringify({
      code: String(code || "").trim(),
    }),
  });
}

/* Mobile verification */

export function sendMobileOtp(phone) {
  return request("/profile-verification/mobile/send", {
    method: "POST",

    body: JSON.stringify({
      phone: String(phone || "").trim(),
    }),
  });
}

export function verifyMobileOtp(code) {
  return request("/profile-verification/mobile/verify", {
    method: "POST",

    body: JSON.stringify({
      code: String(code || "").trim(),
    }),
  });
}

/*
Add this function to frontend/src/services/profileApi.js
*/

export function uploadProfileImage(candidateId, file) {
  if (!candidateId) {
    return Promise.reject(
      new Error("Candidate ID is required")
    );
  }

  if (!file) {
    return Promise.reject(
      new Error("Please choose a profile image")
    );
  }

  const formData = new FormData();
  formData.append("profileImage", file);

  return request(
    `/candidate-profile/${encodeURIComponent(
      candidateId
    )}/profile-image`,
    {
      method: "POST",
      body: formData,
    }
  );
}
