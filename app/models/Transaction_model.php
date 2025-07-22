<?php

class Transaction_model {
    private $table = 'transactions';
    private $db;

    public function __construct() {
        $this->db = new Database();
    }

    public function create($data) {
        $this->db->query(
            'INSERT INTO ' . $this->table . ' (order_id, user_id, game_id, item_name, amount, status, player_id, payment_token, created_at)
             VALUES (:order_id, :user_id, :game_id, :item_name, :amount, :status, :player_id, :payment_token, NOW())'
        );

        $this->db->bind(':order_id', $data['order_id']);
        $this->db->bind(':user_id', $data['user_id']);
        $this->db->bind(':game_id', $data['game_id']);
        $this->db->bind(':item_name', $data['item_name']);
        $this->db->bind(':amount', $data['amount']);
        $this->db->bind(':status', 'pending');
        $this->db->bind(':player_id', $data['player_id']);
        $this->db->bind(':payment_token', $data['payment_token']);

        try {
            return $this->db->execute();
        } catch (PDOException $e) {
            error_log("Error creating transaction: " . $e->getMessage());
            return false;
        }
    }

    public function getTransactionByOrderId($orderId) {
        $this->db->query("SELECT * FROM " . $this->table . " WHERE order_id = :order_id");
        $this->db->bind(':order_id', $orderId);
        return $this->db->single();
    }

    public function updateStatus($orderId, $newStatus) {
        $query = "UPDATE " . $this->table . " SET status = :new_status, updated_at = NOW() WHERE order_id = :order_id";
        $this->db->query($query);
        $this->db->bind(':new_status', $newStatus);
        $this->db->bind(':order_id', $orderId);
        
        try {
            $this->db->execute();
            return $this->db->rowCount();
        } catch (PDOException $e) {
            error_log("Error updating transaction status: " . $e->getMessage());
            return 0;
        }
    }

    public function getHistoryByUser($userId) {
        $this->db->query(
            "SELECT t.order_id, t.item_name, t.amount, t.status, t.created_at, g.name as game_name, g.image_url 
             FROM " . $this->table . " t
             JOIN games g ON t.game_id = g.id
             WHERE t.user_id = :user_id
             ORDER BY t.created_at DESC"
        );
        $this->db->bind(':user_id', $userId);
        return $this->db->resultSet();
    }

    public function getAllTransactions($limit = 25) {
        $this->db->query(
            "SELECT t.*, g.name as game_name, u.username as user_name
             FROM " . $this->table . " t
             JOIN games g ON t.game_id = g.id
             JOIN users u ON t.user_id = u.id
             ORDER BY t.created_at DESC
             LIMIT :limit"
        );
        $this->db->bind(':limit', $limit, PDO::PARAM_INT);
        return $this->db->resultSet();
    }
}