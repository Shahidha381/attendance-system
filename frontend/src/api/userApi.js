// export const registerUser = async (data) => {
//   try {
//     const response = await fetch("http://127.0.0.1:8000/api/users/register/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       console.error("Backend error:", result);
//       throw new Error(result.error || "Registration failed");
//     }

//     return result;

//   } catch (err) {
//     console.error("Fetch error:", err);
//     throw err;
//   }
// };


// export const loginUser = async (data) => {
//   const res = await fetch("http://127.0.0.1:8000/api/users/login/", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   const result = await res.json();

//   if (!res.ok) throw new Error(result.error);
//   return result;
// };


// export const faceLogin = async (imageFile, role) => {
//   const formData = new FormData();
//   formData.append("image", imageFile);
//   formData.append("role", role);

//   const res = await fetch("http://127.0.0.1:8000/api/users/face-login/", {
//     method: "POST",
//     body: formData, // ❗ no JSON, no headers
//   });

//   const result = await res.json();

//   if (!res.ok) throw new Error(result.error);
//   return result;
// };


// export const getStudents = async () => {
//   const token = localStorage.getItem("token");

//   const response = await fetch("http://127.0.0.1:8000/api/users/students/", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.error || "Failed to fetch students");
//   }

//   return data;
// };


// src/api/userApi.js

export const registerUser = async (data) => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/users/register/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Backend error:", result);
      throw new Error(result.error || "Registration failed");
    }

    return result;

  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
};


// PASSWORD LOGIN
export const loginUser = async (data) => {
  try {
    const res = await fetch(
      "http://127.0.0.1:8000/api/users/login/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Login failed");
    }

    return result;

  } catch (err) {
    console.error("Login Error:", err);
    throw err;
  }
};


// FACE LOGIN / FACE VERIFY
// userUuid: optional — if provided, backend verifies face against THAT specific user only.
// This prevents a cross-user token substitution bug where another student's face
// could match and return their token instead of the password-authenticated user's token.
export const faceLogin = async (imageFile, role, userUuid = null) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("role", role);
    if (userUuid) {
      formData.append("user_uuid", userUuid);
    }

    const res = await fetch(
      "http://127.0.0.1:8000/api/users/face-login/",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Face login failed");
    }

    return result;

  } catch (err) {
    console.error("Face Login Error:", err);
    throw err;
  }
};


// GET STUDENTS
export const getStudents = async () => {
  try {

    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://127.0.0.1:8000/api/users/students/",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",

          // JWT TOKEN
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch students");
    }

    return data;

  } catch (err) {
    console.error("Get Students Error:", err);
    throw err;
  }
};