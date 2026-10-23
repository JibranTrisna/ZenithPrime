// Re-export from unified authMiddleware to avoid code duplication
const authMiddleware = require('./authMiddleware');

module.exports = {
    isAuthenticated: authMiddleware.isAuthenticated,
    isGuest: authMiddleware.isGuest,
    isAdmin: authMiddleware.isAdmin,
    isStaff: authMiddleware.isStaff,
    checkRole: authMiddleware.checkRole
};