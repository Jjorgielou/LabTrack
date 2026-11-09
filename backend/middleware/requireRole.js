
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        console.log("=== ROLE CHECK ===");
        console.log("URL:", req.originalUrl);
        console.log("METHOD:", req.method);
        console.log("SESSION USER:", req.session?.user);
        console.log("ACTUAL ROLE:", req.session?.user?.role);
        console.log("ALLOWED ROLES:", allowedRoles);

        if (!req.session || !req.session.user) {
            return res.status(401).json({
                message: "Unauthorized. Please log in first."
            });
        }

        if (!allowedRoles.includes(req.session.user.role)) {
            console.log("ACCESS DENIED");

            return res.status(403).json({
                message: "Forbidden. You do not have permission."
            });
        }

        console.log("ACCESS GRANTED");
        next();
    };
}

module.exports = requireRole;
