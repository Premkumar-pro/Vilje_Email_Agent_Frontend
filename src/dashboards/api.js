import { BASE_URL } from "../config";

function authHeader() {
  const token = sessionStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Upload Excel
export async function uploadExcel(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload/excel`, {
    method: "POST",
    headers: {
      ...authHeader(),
    },
    body: formData,
  });

  return res.json();
}

// (future)
// export async function getDashboardStats() {}
// export async function getLogs() {}
