// import { createContext, useState, useEffect } from "react";
// import { onSignin } from "./signin";

// // Create Context
// export const AuthContext = createContext();

// // Provider Component
// export const AuthProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(null);

//   // Fetch login status on mount
//   useEffect(() => {
//     onSignin(setIsLoggedIn);
//   }, []);

//   return (
//     <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };