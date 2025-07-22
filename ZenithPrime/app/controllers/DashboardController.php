<?php

class DashboardController extends Controller {
    private $userModel;
    private $gameModel;
    private $informationModel;

    public function __construct() {

        $this->userModel = $this->model('User_model');
        $this->gameModel = $this->model('Game_model');
        $this->informationModel = $this->model('Information_model');
    }

    public function index() {
        $data = [
            'title' => 'Dashboard',
            'user' => null,
            'slider' => [],
            'recent_informations' => [],
            'special_promos' => [] 
        ];

        if (isset($_SESSION['user_id']) && $_SESSION['user_id'] > 0) {
            $data['user'] = $this->userModel->getUserById($_SESSION['user_id']);
        }
        
        $data['slider'] = [
            [
                "video" => "assets/videos/ML.mp4", 
                "poster" => "https://images.alphacoders.com/133/1337580.jpeg",
                "title" => "Mobile Legends",
                "desc" => "Tingkatkan pengalaman bermainmu dengan skin keren dan top up diamond Mobile Legends."
            ],
            [
                "video" => "assets/videos/Valo.mp4", 
                "poster" => "https://images.alphacoders.com/133/1332943.jpeg",
                "title" => "Valorant",
                "desc" => "Tingkatkan akurasi dan gayamu. Beli Valorant Points untuk mendapatkan skin senjata premium."
            ],
            [
                "video" => "assets/videos/Valo.mp4", 
                "poster" => "https://images.hdqwalls.com/wallpapers/garena-free-fire-2022-4k-ja.jpg",
                "title" => "Free Fire",
                "desc" => "Dapatkan Booyah lebih sering! Top up diamond untuk membeli karakter, senjata, dan item eksklusif di Free Fire."
            ],
        ];

        $data['recent_informations'] = $this->informationModel->getInformations(3); 

        $data['special_promos'] = [
            [
                'game_id' => 1,
                'item_id' => 101,
                'game_name' => 'Mobile Legends',
                'item_name' => '1050 Diamond Mobile Legends',
                'image_url' => 'assets/images/ML.png',
                'original_price' => '250000',
                'promo_price' => '239000'
            ],
            [
                'game_id' => 1,
                'item_id' => 102,
                'game_name' => 'Mobile Legends',
                'item_name' => 'Weekly Diamond Pass Mobile Legends',
                'image_url' => 'assets/images/ML.png',
                'original_price' => '30000',
                'promo_price' => '28500'
            ],
            [
                'game_id' => 3,
                'item_id' => 201,
                'game_name' => 'Valorant',
                'item_name' => '1000 VP Valorant',
                'image_url' => 'assets/images/Valo.png',
                'original_price' => '110000',
                'promo_price' => '107000'
            ],
            [
                'game_id' => 2,
                'item_id' => 301,
                'game_name' => 'Free Fire',
                'item_name' => '1000 Diamond Free Fire',
                'image_url' => 'assets/images/FF.png',
                'original_price' => '150000',
                'promo_price' => '145000'
            ],
        ];

        $this->view('layouts/header', $data);
        $this->view('dashboard', $data);
        $this->view('layouts/footer');
    }
}