<?php

class InformationController extends Controller {
    private $informationModel;

    public function __construct() {
        $this->informationModel = $this->model('Information_model');
    }

    public function index() {
        $informations = $this->informationModel->getInformations();

        $data = [
            'title' => 'Informasi & Berita',
            'informations' => $informations
        ];

        $this->view('layouts/header', $data);
        $this->view('information/index', $data);
        $this->view('layouts/footer');
    }

    public function detail($slug = null) {
        if (is_null($slug)) {
            header('Location: ' . BASE_URL . '/information');
            exit();
        }

        $info = $this->informationModel->getInformationBySlug($slug);

        if (!$info) {
            header('Location: ' . BASE_URL . '/information');
            exit();
        }

        $data = [
            'title' => $info['title'],
            'info_detail' => $info
        ];

        $this->view('layouts/header', $data);
        $this->view('information/detail', $data);
        $this->view('layouts/footer');
    }
}