function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                message: "Unauthorized. Please log in first."
            });
        }

        if (!allowedRoles.includes(req.session.user.role)) {
            return res.status(403).json({
                message: "Forbidden. You do not have permission."
            });
        }

        next();
    };
}

module.exports = requireRole;