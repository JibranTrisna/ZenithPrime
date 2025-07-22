<?php

class User_model {
    private $table = 'users'; 
    private $db;

    public function __construct() {
        $this->db = new Database(); 
    }

    public function getUserById($id) {
        $this->db->query("SELECT * FROM " . $this->table . " WHERE id = :id");
        $this->db->bind('id', $id);
        return $this->db->single();
    }

    public function getUserByUsername($username) {
        $this->db->query("SELECT * FROM " . $this->table . " WHERE username = :username");
        $this->db->bind('username', $username);
        return $this->db->single();
    }

    public function findUserByEmail($email) {
        $this->db->query("SELECT * FROM " . $this->table . " WHERE email = :email");
        $this->db->bind(':email', $email);
        return $this->db->single();
    }

    public function register($data) {
        $query = "INSERT INTO " . $this->table . " (username, email, password, role, created_at) VALUES (:username, :email, :password, :role, NOW())";
        
        $this->db->query($query);
        $this->db->bind(':username', $data['username']);
        $this->db->bind(':email', $data['email']);
        $this->db->bind(':password', $data['password']);
        $this->db->bind(':role', $data['role'] ?? 'user');

        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }
}