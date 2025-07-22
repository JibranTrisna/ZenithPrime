<?php

class Log_model {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    public function logLogin($userId) {
        $this->db->query('INSERT INTO login_logs (user_id, ip_address) VALUES (:user_id, :ip_address)');
        $this->db->bind(':user_id', $userId);
        $this->db->bind(':ip_address', $_SERVER['REMOTE_ADDR']);

        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

        public function getAllLoginLogs($limit = 25) {
        $this->db->query(
            "SELECT l.*, u.username, u.email 
             FROM login_logs l
             JOIN users u ON l.user_id = u.id
             ORDER BY l.login_time DESC
             LIMIT :limit"
        );
        $this->db->bind(':limit', $limit);
        return $this->db->resultSet();
    }
}