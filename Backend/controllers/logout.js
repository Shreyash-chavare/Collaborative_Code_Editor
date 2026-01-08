const logout = (req, res) => {
    try {
        // Clear the session
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Logout failed" });
            }
            
            // Clear the cookie
            res.clearCookie("user-token");
            res.clearCookie("connect.sid");
            
            // Send success response
            res.json({ success: true, message: "Logged out successfully" });
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: "Logout failed" });
    }
}

export default logout;