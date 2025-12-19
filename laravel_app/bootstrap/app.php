<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'xss.check' => \App\Http\Middleware\XssProtectionMiddleware::class,
        ]);
        $middleware->validateCsrfTokens(except: [
            // Disable CSRF for easier testing, in prod enable via proper tokens
            // 'check', 'posts' 
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
