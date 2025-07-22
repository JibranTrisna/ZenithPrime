<?php

class AuthController {
    private $userModel;
    private $logModel;

    public function __construct() {
        $this->userModel = new User_model();
        $this->logModel = new Log_model();
    }

    private function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    private function isValidPassword($pw) {
        return strlen($pw) >= 8 && preg_match('/[A-Z]/', $pw) && preg_match('/[0-9]/', $pw);
    }

    public function login($data = []) {
        if (isset($_SESSION['success_msg'])) {
            $data['success'] = $_SESSION['success_msg'];
            unset($_SESSION['success_msg']);
        }
        require_once '../app/views/auth/login.php';
    }

    public function register($data = []) {
        require_once '../app/views/auth/register.php';
    }

    public function processRegister() {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return header('location: ' . BASE_URL . '/auth/register');
        }

        $data = [
            'username' => trim($_POST['username']),
            'email' => trim($_POST['email']),
            'password' => $_POST['password']
        ];

        if (!is_string($data['username']) || empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            return $this->register(['error' => 'Semua kolom wajib diisi.']);
        }
        if (!$this->isValidEmail($data['email'])) {
            return $this->register(['error' => 'Format email tidak valid.']);
        }
        if (!$this->isValidPassword($data['password'])) {
            return $this->register(['error' => 'Password minimal 8 karakter, harus ada huruf besar dan angka.']);
        }
        if ($this->userModel->findUserByEmail($data['email'])) {
            return $this->register(['error' => 'Email sudah terdaftar.']);
        }

        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        
        if ($this->userModel->register($data)) {
            $_SESSION['success_msg'] = "Registrasi berhasil, silakan login!";
            header('location: ' . BASE_URL . '/auth/login');
        } else {
            $this->register(['error' => 'Terjadi kesalahan saat registrasi.']);
        }
    }

    public function processLogin() {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return header('location: ' . BASE_URL . '/auth/login');
        }

        $email = trim($_POST['email']);
        $password = $_POST['password'];

        $user = $this->userModel->findUserByEmail($email);

        if ($user && password_verify($password, $user->password)) {
            $_SESSION['user_id'] = $user->id;
            $_SESSION['user_name'] = $user->username;
            $_SESSION['user_role'] = $user->role;

            $this->logModel->logLogin($user->id);

            $redirect_url = ($user->role == 'admin') ? '/admin' : '/dashboard';
            header('location: ' . BASE_URL . $redirect_url);
        } else {
            $this->login(['error' => 'Email atau password salah!']);
        }
    }

    public function logout() {
        session_unset();
        session_destroy();
        header('location: ' . BASE_URL . '/auth/login');
    }
}