export const authcheck = (req, res) => {
    try {
        console.log('Auth check - Session:', req.session);
        console.log('Auth check - User:', req.session.user);
        
        if (req.session && req.session.user) {
            // Session exists and has user data
            res.status(200).json({
                success: true,
                user: req.session.user
            });
        } else {
            // No session or no user data
            console.log('No valid session found');
            res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }
    } catch (error) {
        console.log("Auth check controller error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}