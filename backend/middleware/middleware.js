exports. verifyToken = (req, res, next) => {
    console.log("Middleware: checking token. . .");
    next();
};