<?php

class TransactionController {
    private $transactionModel;

    public function __construct() {
        $this->transactionModel = new Transaction_model();
    }

    public function processPayment() {
        if (!isset($_SESSION['user_id'])) {
            $_SESSION['error_msg'] = "Anda harus login untuk melakukan transaksi."; 
            header('location: ' . BASE_URL . '/auth/login');
            exit();
        }

        \Midtrans\Config::$serverKey = MIDTRANS_SERVER_KEY;
        \Midtrans\Config::$isProduction = MIDTRANS_IS_PRODUCTION;
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $itemJson = $_POST['item'] ?? null;
            $item = $itemJson ? json_decode($itemJson, true) : null;

            if (!$item || !isset($item['price'], $item['name']) || !isset($_POST['game_id'], $_POST['player_id'])) {
                $_SESSION['error_msg'] = "Data item atau game tidak lengkap. Silakan coba lagi.";
                error_log("ERROR: Invalid POST data in processPayment. POST: " . json_encode($_POST)); // Tambahkan logging ini
                header('location: ' . BASE_URL . '/');
                exit();
            }

            $orderId = 'ZP-' . time() . '-' . $_SESSION['user_id']; 
            $params = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $item['price'],
                ],
                'customer_details' => [
                    'first_name' => $_SESSION['user_name'] ?? 'Guest',
                    'email' => $_SESSION['user_email'] ?? 'user-dummy@zenithprime.com',
                ],
                'item_details' => [
                    [
                        'id' => $_POST['game_id'],
                        'price' => $item['price'],
                        'quantity' => 1,
                        'name' => $item['name']
                    ]
                ]
            ];

            try {
                $snapToken = \Midtrans\Snap::getSnapToken($params);
                
                if (!$snapToken) { // Penting: Tambahkan pengecekan ini
                    throw new Exception("Midtrans Snap Token is empty. Check Server Key and Midtrans account configuration.");
                }

                $dataToSave = [
                    'order_id' => $orderId,
                    'user_id' => $_SESSION['user_id'],
                    'game_id' => $_POST['game_id'],
                    'item_name' => $item['name'],
                    'amount' => $item['price'],
                    'player_id' => trim($_POST['player_id']),
                    'payment_token' => $snapToken,
                    'status' => 'pending' 
                ];

                if ($this->transactionModel->create($dataToSave)) {
                    $data = [
                        'title' => 'Pembayaran',
                        'snap_token' => $snapToken,
                    ];

                    require_once '../app/views/layouts/header.php';
                    require_once '../app/views/payment.php';
                    require_once '../app/views/layouts/footer.php';
                    
                    // *** SOLUSI UTAMA: HENTIKAN EKSEKUSI PHP DI SINI ***
                    exit(); 

                } else {
                    $_SESSION['error_msg'] = "Terjadi kesalahan: Gagal menyimpan data transaksi ke database.";
                    error_log("ERROR: Failed to save transaction to database for Order ID: " . $orderId);
                    header('location: ' . BASE_URL . '/'); 
                    exit();
                }

            } catch (Exception $e) {
                $_SESSION['error_msg'] = "Terjadi kesalahan saat memproses pembayaran: " . $e->getMessage();
                error_log("EXCEPTION in processPayment: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
                header('location: ' . BASE_URL . '/'); 
                exit();
            }
        } else {
            $_SESSION['error_msg'] = "Metode tidak diizinkan. Silakan ulangi dari halaman produk."; 
            header('location: ' . BASE_URL . '/');
            exit();
        }
    }

    public function history() {
        if (!isset($_SESSION['user_id'])) {
            header('location: ' . BASE_URL . '/auth/login');
            exit();
        }

        $history = $this->transactionModel->getHistoryByUser($_SESSION['user_id']);

        $data = [
            'title' => 'Riwayat Transaksi',
            'history' => $history
        ];

        require_once '../app/views/layouts/header.php';
        require_once '../app/views/history.php';
        require_once '../app/views/layouts/footer.php';
    }

    public function notification() {
        \Midtrans\Config::$serverKey = MIDTRANS_SERVER_KEY;
        \Midtrans\Config::$isProduction = MIDTRANS_IS_PRODUCTION;
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo "Method Not Allowed";
            exit();
        }

        try {
            file_put_contents(BASEPATH . '/midtrans_notif_debug.log', date('Y-m-d H:i:s') . " - Processing notification. Raw Input:\n" . file_get_contents('php://input') . "\n----\n", FILE_APPEND);

            $notif = new \Midtrans\Notification();

            file_put_contents(BASEPATH . '/midtrans_notif_debug.log', date('Y-m-d H:i:s') . " - Notification object created. Order ID: " . $notif->order_id . ", Status: " . $notif->transaction_status . ", Fraud: " . $notif->fraud_status . ", Payment Type: " . ($notif->payment_type ?? 'N/A') . "\n", FILE_APPEND);

            $transactionStatus = $notif->transaction_status;
            $orderId = $notif->order_id;
            $fraudStatus = $notif->fraud_status;
            $paymentType = $notif->payment_type;

            $newStatus = 'pending';

            if ($transactionStatus == 'capture') {
                if ($paymentType == 'credit_card') {
                    if ($fraudStatus == 'challenge') {
                        $newStatus = 'pending';
                    } else {
                        $newStatus = 'success';
                    }
                }
            } elseif ($transactionStatus == 'settlement') {
                $newStatus = 'success';
            } elseif ($transactionStatus == 'pending') {
                $newStatus = 'pending';
            } elseif ($transactionStatus == 'deny') {
                $newStatus = 'failed';
            } elseif ($transactionStatus == 'expire') {
                $newStatus = 'failed';
            } elseif ($transactionStatus == 'cancel') {
                $newStatus = 'failed';
            }

            file_put_contents(BASEPATH . '/midtrans_notif_debug.log', date('Y-m-d H:i:s') . " - Calculated newStatus: {$newStatus} for Order ID: {$orderId}\n", FILE_APPEND);

            $currentTransaction = $this->transactionModel->getTransactionByOrderId($orderId);
            
            if ($currentTransaction) {
                $currentStatusInDb = $currentTransaction['status'];

                if ($currentStatusInDb !== $newStatus) {
                    if ($this->transactionModel->updateStatus($orderId, $newStatus)) {
                        file_put_contents(BASEPATH . '/midtrans_notif_debug.log', date('Y-m-d H:i:s') . " - Status updated to {$newStatus} for Order ID: {$orderId}\n", FILE_APPEND);
                        http_response_code(200);
                        echo "OK";
                    } else {
                        error_log("Failed to update transaction status for Order ID: {$orderId} to status: {$newStatus} in DB.");
                        http_response_code(500);
                        echo "Failed to update status in database";
                    }
                } else {
                    file_put_contents(BASEPATH . '/midtrans_notif_debug.log', date('Y-m-d H:i:s') . " - Status for Order ID: {$orderId} already {$newStatus}. No update needed.\n", FILE_APPEND);
                    http_response_code(200);
                    echo "OK";
                }
            } else {
                error_log("Notification received for non-existent Order ID: {$orderId}.");
                http_response_code(404);
                echo "Order ID not found.";
            }

        } catch (Exception $e) {
            error_log("Midtrans Notification EXCEPTION: " . $e->getMessage() . " on line " . $e->getLine() . " in " . $e->getFile());
            http_response_code(500);
            echo "Error processing notification: " . $e->getMessage();
        }
        exit();
    }

    public function resumePayment() {
        if (!isset($_SESSION['user_id'])) {
            header('location: ' . BASE_URL . '/auth/login');
            exit();
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $_SESSION['error_msg'] = "Metode tidak diizinkan.";
            header('location: ' . BASE_URL . '/transaction/history');
            exit();
        }

        $orderId = $_POST['order_id'] ?? null;

        if (empty($orderId)) {
            $_SESSION['error_msg'] = "Order ID tidak ditemukan untuk melanjutkan pembayaran.";
            header('location: ' . BASE_URL . '/transaction/history');
            exit();
        }

        $transaction = $this->transactionModel->getTransactionByOrderId($orderId);

        if ($transaction && $transaction['status'] == 'pending' && $transaction['user_id'] == $_SESSION['user_id']) { 
            \Midtrans\Config::$serverKey = MIDTRANS_SERVER_KEY;
            \Midtrans\Config::$isProduction = MIDTRANS_IS_PRODUCTION;
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            $data = [
                'title' => 'Lanjutkan Pembayaran',
                'snap_token' => $transaction['payment_token']
            ];

            require_once '../app/views/layouts/header.php';
            require_once '../app/views/payment.php';
            require_once '../app/views/layouts/footer.php';

        } else {
            $_SESSION['error_msg'] = "Transaksi tidak dapat dilanjutkan. Mungkin tidak ditemukan, sudah dibayar, atau bukan milik Anda.";
            header('location: ' . BASE_URL . '/transaction/history');
            exit();
        }
    }

    public function cancelPayment() {
        if (!isset($_SESSION['user_id'])) {
            header('location: ' . BASE_URL . '/auth/login');
            exit();
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $_SESSION['error_msg'] = "Metode tidak diizinkan.";
            header('location: ' . BASE_URL . '/transaction/history');
            exit();
        }

        $orderId = $_POST['order_id'] ?? null;

        if (empty($orderId)) {
            $_SESSION['error_msg'] = "Order ID tidak ditemukan untuk pembatalan.";
            header('location: ' . BASE_URL . '/transaction/history');
            exit();
        }

        $transaction = $this->transactionModel->getTransactionByOrderId($orderId);

        if ($transaction && $transaction['status'] == 'pending' && $transaction['user_id'] == $_SESSION['user_id']) { 
            if ($this->transactionModel->updateStatus($orderId, 'failed')) { 
                $_SESSION['success_msg'] = "Transaksi dengan Order ID: " . htmlspecialchars($orderId) . " berhasil dibatalkan.";
            } else {
                $_SESSION['error_msg'] = "Gagal membatalkan transaksi dengan Order ID: " . htmlspecialchars($orderId) . ". Silakan coba lagi.";
            }
        } else {
            $_SESSION['error_msg'] = "Transaksi tidak dapat dibatalkan. Mungkin sudah selesai atau bukan milik Anda.";
        }
        header('location: ' . BASE_URL . '/transaction/history');
        exit();
    }
}