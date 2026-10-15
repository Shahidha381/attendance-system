// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children, role }) => {
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (!user) return <Navigate to="/login" />;

//   if (role && user.role !== role) {
//     return <Navigate to="/login" />;
//   }

//   return children;
// };

// export default ProtectedRoute;


import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Not logged in
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;