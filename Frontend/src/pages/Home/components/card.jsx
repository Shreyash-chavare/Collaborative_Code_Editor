import { motion } from "framer-motion";
import { useState } from "react";

export default function HoverCard({ text, hoverText }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout // Ensures smooth reordering of sibling elements
      initial={{ width: 120, height: 60, borderRadius: "8px" }}
      animate={isHovered ? { width: 250, height: "auto", padding: "16px" } : { width: 120, height: 60 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="cursor-pointer flex items-center justify-center text-center"
      style={{
        backgroundColor: "#e29a14",
        borderRadius: "8px",
        overflow: "hidden",
        minHeight: "60px",
        color: "#111111", // Text color
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        key={isHovered ? "hoverText" : "defaultText"}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="w-full h-full flex items-center justify-center p-2"
        style={{
          fontSize: isHovered ? "16px" : "14px", // Increased font size
          whiteSpace: "normal",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          color: "#111111", // Ensure text remains black
          fontWeight: "600", // Make it slightly bolder for better readability
        }}
      >
        {isHovered ? hoverText : text}
      </motion.div>
    </motion.div>
  );
}
