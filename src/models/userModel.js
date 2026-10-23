const db = require('../config/database');

// Inisialisasi tabel password_resets jika belum ada
(async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                token VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_token (token)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
    } catch (err) {
        console.error("Gagal inisialisasi tabel password_resets:", err.message);
    }
})();

exports.findByEmailOrPhone = async (identifier) => {
    const query = "SELECT * FROM users WHERE email = ? OR phone = ?";
    const [rows] = await db.query(query, [identifier, identifier]);
    return rows;
};

exports.findById = async (id) => {
    const query = "SELECT * FROM users WHERE id = ?";
    const [rows] = await db.query(query, [id]);
    return rows[0];
};

exports.create = async (userData) => {
    const query = `
        INSERT INTO users (name, email, phone, password, role) 
        VALUES (?, ?, ?, ?, 'user')
    `;
    
    const [result] = await db.query(query, [
        userData.name, 
        userData.email, 
        userData.phone, 
        userData.password
    ]);
    
    return result;
};

exports.updatePassword = async (id, newHashedPassword) => {
    const query = "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?";
    const [result] = await db.query(query, [newHashedPassword, id]);
    return result;
};

// ==========================================
// 🔐 PASSWORD RESET TOKEN METHODS
// ==========================================

exports.createPasswordReset = async (email, token, expiresAt) => {
    // Hapus token lama untuk email yang sama sebelum membuat yang baru
    await db.query("DELETE FROM password_resets WHERE email = ?", [email]);
    
    const query = `
        INSERT INTO password_resets (email, token, expires_at)
        VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [email, token, expiresAt]);
    return result;
};

exports.findPasswordReset = async (token) => {
    const query = `
        SELECT pr.*, u.id as user_id, u.name as user_name
        FROM password_resets pr
        JOIN users u ON pr.email = u.email
        WHERE pr.token = ? AND pr.expires_at > NOW()
        ORDER BY pr.id DESC
        LIMIT 1
    `;
    const [rows] = await db.query(query, [token]);
    return rows[0];
};

exports.deletePasswordReset = async (email) => {
    const query = "DELETE FROM password_resets WHERE email = ?";
    const [result] = await db.query(query, [email]);
    return result;
};