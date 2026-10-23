const db = require('../src/config/database');

async function initCsTickets() {
    try {
        const sql = `
        CREATE TABLE IF NOT EXISTS cs_tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id VARCHAR(50) NOT NULL UNIQUE,
            user_id INT NOT NULL,
            category VARCHAR(50) DEFAULT 'GENERAL_QUERY',
            urgency ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'low',
            status ENUM('needs_followup', 'in_progress', 'resolved', 'ai_handled') DEFAULT 'ai_handled',
            summary VARCHAR(255) DEFAULT 'Chatbot Conversation',
            order_id VARCHAR(100) NULL,
            last_user_message TEXT NULL,
            last_ai_message TEXT NULL,
            is_complaint TINYINT(1) DEFAULT 0,
            is_ai_paused TINYINT(1) DEFAULT 0,
            handled_by INT NULL,
            notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_status (status),
            INDEX idx_is_complaint (is_complaint),
            INDEX idx_urgency (urgency)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await db.query(sql);
        console.log('✅ cs_tickets table initialized successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing cs_tickets table:', err);
        process.exit(1);
    }
}

initCsTickets();
