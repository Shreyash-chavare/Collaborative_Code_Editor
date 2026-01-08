import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BackgroundGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      className="absolute top-0 left-0 pointer-events-none"
      animate={{
        x: mousePosition.x - 250, // Offset by half the width
        y: mousePosition.y - 250, // Offset by half the height
      }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
      style={{
        background: "radial-gradient(circle, rgba(226,154,20,0.3) 0%, rgba(0,0,0,0) 60%)",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        position: "absolute",
        filter: "blur(80px)",
      }}
    />
  );
}
