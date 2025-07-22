<?php

class PrivacyController extends Controller {
    public function index() {
        $data['title'] = 'Kebijakan Privasi - ZenithPrime';
        $this->view('layouts/header', $data);
        $this->view('privacy', $data);
        $this->view('layouts/footer');
    }
}