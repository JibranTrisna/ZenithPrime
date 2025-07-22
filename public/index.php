<?php

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

define('BASEPATH', dirname(__DIR__));
define('APP_PATH', BASEPATH . '/app');
define('CONFIG_PATH', BASEPATH . '/config');
define('VENDOR_PATH', BASEPATH . '/vendor');

if (file_exists(VENDOR_PATH . '/autoload.php')) {
    require_once VENDOR_PATH . '/autoload.php';
} else {
    die('Composer dependencies not installed. Run "composer install".');
}

require_once CONFIG_PATH . '/config.php';

spl_autoload_register(function ($className) {
    $paths = [
        APP_PATH . '/core/' . $className . '.php',
        APP_PATH . '/controllers/' . $className . '.php',
        APP_PATH . '/models/' . $className . '.php',
    ];

    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            return;
        }
    }
});


class App
{
    protected $controller = 'HomeController';
    protected $method = 'index';
    protected $params = [];

    public function __construct()
    {
        $url = $this->parseUrl();

        if (isset($url[0]) && $url[0] === 'transaction' &&
            isset($url[1]) && $url[1] === 'notification' &&
            $_SERVER['REQUEST_METHOD'] === 'POST')
        {
            $this->controller = 'TransactionController';
            $this->method = 'notification';
            $this->params = [];
            $this->executeController();
            exit;
        }

        if (isset($url[0]) && $url[0] === 'transaction' &&
            isset($url[1]) && ($url[1] === 'resumePayment' || $url[1] === 'cancelPayment'))
        {
            $this->controller = 'TransactionController';
            $this->method = $url[1];
            $this->params = array_slice($url, 2);
            $this->executeController();
            exit;
        }

        if (isset($url[0]) && !empty($url[0])) {
            $proposedController = ucwords($url[0]) . 'Controller';
            $controllerFile = APP_PATH . '/controllers/' . $proposedController . '.php';

            if (file_exists($controllerFile)) {
                $this->controller = $proposedController;
                unset($url[0]);
            } else {
                $this->controller = 'HomeController';
                $this->method = $url[0];
            }
        }
        
        if (class_exists($this->controller) && isset($url[1])) {
            $methodCandidate = $url[1];
            $tempController = new $this->controller(); 
            if (method_exists($tempController, $methodCandidate)) {
                $this->method = $methodCandidate;
                unset($url[1]);
            }
            unset($tempController);
        }
        
        $this->params = $url ? array_values($url) : [];
        $this->executeController();
    }

    public function parseUrl()
    {
        if (isset($_GET['url'])) {
            $url = rtrim($_GET['url'], '/');
            $url = filter_var($url, FILTER_SANITIZE_URL);
            return explode('/', $url);
        }
        return [];
    }

    protected function executeController()
    {

        if (class_exists($this->controller)) {
            $controllerInstance = new $this->controller();
            if (method_exists($controllerInstance, $this->method)) {
                call_user_func_array([$controllerInstance, $this->method], $this->params);
            } else {
                error_log("Error: Method '{$this->method}' not found in controller '{$this->controller}'. Request URL: " . ($_GET['url'] ?? ''));
                header('Location: ' . BASE_URL . '/dashboard');
                exit();
            }
        } else {
            error_log("Error: Controller class '{$this->controller}' not found. Request URL: " . ($_GET['url'] ?? ''));
            header('Location: ' . BASE_URL . '/dashboard');
            exit();
        }
    }
}

$app = new App;