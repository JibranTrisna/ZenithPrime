<?php

class AdminController {
    private $logModel;
    private $transactionModel;

    public function __construct() {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] != 'admin') {
            header('location: ' . BASE_URL . '/dashboard');
            exit();
        }

        $this->logModel = new Log_model();
        $this->transactionModel = new Transaction_model();
    }

    public function index() {
        $data = [
            'title' => 'Admin Panel'
        ];

        require_once '../app/views/layouts/header.php';
        require_once '../app/views/admin.php'; 
        require_once '../app/views/layouts/footer.php';
    }

    public function getLoginData() {
        $logs = $this->logModel->getAllLoginLogs(50);
        header('Content-Type: application/json');
        echo json_encode($logs);
    }

    public function getTransactionData() {
        $transactions = $this->transactionModel->getAllTransactions(50);
        header('Content-Type: application/json');
        echo json_encode($transactions);
    }
}