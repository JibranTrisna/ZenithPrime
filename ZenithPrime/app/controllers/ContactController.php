<?php

class ContactController extends Controller {
    public function index() {
        $data['title'] = 'Kontak Kami - ZenithPrime';
        $this->view('layouts/header', $data);
        $this->view('contact', $data);
        $this->view('layouts/footer');
    }

}