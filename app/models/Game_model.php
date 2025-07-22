<?php

class Game_model {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    public function getPopularGames() {
        $this->db->query("SELECT * FROM games WHERE is_active = 1 AND is_popular = 1 ORDER BY name ASC");
        return $this->db->resultSet();
    }

    public function getAllActiveGamesSorted() {
        $this->db->query("SELECT * FROM games WHERE is_active = 1 ORDER BY name ASC");
        return $this->db->resultSet();
    }

    public function getAllGames() {
        $this->db->query("SELECT * FROM " . $this->table . " ORDER BY name ASC");
        return $this->db->resultSet();
    }

    public function getGameById($id) {
        $this->db->query("SELECT * FROM games WHERE id = :id");
        $this->db->bind(':id', $id);
        return $this->db->single();
    }

    public function getRegularItemsByGameId($gameId) {
        $this->db->query("SELECT * FROM items WHERE game_id = :game_id AND is_active = 1 AND is_special = 0 ORDER BY price ASC");
        $this->db->bind(':game_id', $gameId);
        return $this->db->resultSet();
    }

    public function getSpecialItemsByGameId($gameId) {
        $this->db->query("SELECT * FROM items WHERE game_id = :game_id AND is_active = 1 AND is_special = 1 ORDER BY price ASC");
        $this->db->bind(':game_id', $gameId);
        return $this->db->resultSet();
    }
}