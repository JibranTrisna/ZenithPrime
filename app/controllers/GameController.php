<?php

class GameController {
    private $gameModel;

    public function __construct() {
        if (!isset($_SESSION['user_id'])) {
            header('location: ' . BASE_URL . '/auth/login');
            exit();
        }
        
        $this->gameModel = new Game_model();
    }

    public function index() {
        $popular_games = $this->gameModel->getPopularGames();
        $all_games = $this->gameModel->getAllActiveGamesSorted();

        $data = [
            'title' => 'Pilih Game',
            'popular_games' => $popular_games,
            'all_games' => $all_games
        ];

        require_once '../app/views/layouts/header.php';
        require_once '../app/views/menu.php';
        require_once '../app/views/layouts/footer.php';
    }

    public function detail($id) {
        $game = $this->gameModel->getGameById($id);

        if (!$game) {
            die('Game tidak ditemukan.');
        }

        $regular_items = $this->gameModel->getRegularItemsByGameId($id);
        $special_items = $this->gameModel->getSpecialItemsByGameId($id);

        $data = [
            'title' => $game['name'], 
            'game' => $game, 
            'regular_items' => $regular_items,
            'special_items' => $special_items 
        ];

        require_once '../app/views/layouts/header.php';
        require_once '../app/views/game_detail.php';
        require_once '../app/views/layouts/footer.php';
    }
}