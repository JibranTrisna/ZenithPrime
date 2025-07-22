<?php

class Transaction_model {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    public function create($data) {
        $this->db->query(
            'INSERT INTO transactions (order_id, user_id, game_id, item_name, amount, status, player_id, payment_token)
             VALUES (:order_id, :user_id, :game_id, :item_name, :amount, :status, :player_id, :payment_token)'
        );

        $this->db->bind(':order_id', $data['order_id']);
        $this->db->bind(':user_id', $data['user_id']);
        $this->db->bind(':game_id', $data['game_id']);
        $this->db->bind(':item_name', $data['item_name']);
        $this->db->bind(':amount', $data['amount']);
        $this->db->bind(':status', 'pending');
        $this->db->bind(':player_id', $data['player_id']);
        $this->db->bind(':payment_token', $data['payment_token']);

        return $this->db->execute();
    }

    public function getTransactionByOrderId($orderId) {
        $this->db->query("SELECT * FROM transactions WHERE order_id = :order_id");
        $this->db->bind(':order_id', $orderId);
        return $this->db->single();
    }

    public function updateStatus($orderId, $status) {
        $this->db->query("UPDATE transactions SET status = :status WHERE order_id = :order_id");
        $this->db->bind(':status', $status);
        $this->db->bind(':order_id', $orderId);
        return $this->db->execute();
    }

    public function getHistoryByUser($userId) {
        $this->db->query(
            "SELECT t.*, g.name as game_name, g.image_url 
             FROM transactions t
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
             FROM transactions t
             JOIN games g ON t.game_id = g.id
             JOIN users u ON t.user_id = u.id
             ORDER BY t.created_at DESC
             LIMIT :limit"
        );
        $this->db->bind(':limit', $limit);
        return $this->db->resultSet();
    }
}