<?php

class Controller {
    
    public function model($model) {
        $modelPath = APP_PATH . '/models/' . $model . '.php';
        if (file_exists($modelPath)) {
            require_once $modelPath;
            if (class_exists($model)) {
                return new $model();
            } else {
                error_log("Model class '$model' not found in file: $modelPath");
                die("Error: Model class '$model' not found.");
            }
        } else {
            error_log("Model file not found: $modelPath");
            die("Error: Model file not found.");
        }
    }

    public function view($view, $data = []) {
        extract($data);

        $viewPath = APP_PATH . '/views/' . $view . '.php';
        if (file_exists($viewPath)) {
            require_once $viewPath;
        } else {
            error_log("View file not found: $viewPath");
            die("Error: View file not found.");
        }
    }
}