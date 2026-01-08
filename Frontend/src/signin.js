import { useNavigate } from "react-router-dom";
import { useAuthstore } from "./stores/auth";
import toast from 'react-hot-toast';

export const onSignin = async (formData, navigate) => {
    const { login } = useAuthstore.getState();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (data.success) {
        // Update auth store with user data
        await login(data.user);
        toast.success("Login successful");
        // Navigate to home page after successful login
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Login failed");
    }
};
  
