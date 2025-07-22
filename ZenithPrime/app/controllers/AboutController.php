<?php

class AboutController extends Controller {
    public function index() {
        $data['title'] = 'Tentang Kami - ZenithPrime';
        $this->view('layouts/header', $data);
        $this->view('about', $data);
        $this->view('layouts/footer');
    }
}