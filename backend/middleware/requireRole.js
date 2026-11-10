module.exports = (...roles) => {
    // Support both an array and separate role arguments
    const allowedRoles = Array.isArray(roles[0])
        ? roles[0]
        : roles;

    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                message: "Unauthorized. Please log in."
            });
        }

        const roleMap = {
            1: "Admin",
            2: "Laboratory Staff",
            3: "Student"
        };

        const rawRole =
            req.session.user.role ||
            req.session.user.role_id;

        const userRole = roleMap[rawRole] || rawRole;

        if (allowedRoles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({
            message: "Forbidden. You do not have permission."
        });
    };
};
