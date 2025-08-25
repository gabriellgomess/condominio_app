<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiController;

use App\Http\Controllers\Categorias\CategoriasController;
use App\Http\Controllers\Cidades\CidadesController;
use App\Http\Controllers\Bairros\BairrosController;
use App\Http\Controllers\Links\LinksController;
use App\Http\Controllers\Estados\EstadosController;
use App\Http\Controllers\Checkout\CheckoutController;
use App\Http\Controllers\Checkout\CheckoutWebhookController;
use App\Http\Controllers\Checkout\CheckoutQueryController;


// Rotas públicas - não precisam de autenticação
// Register
Route::post("register", [ApiController::class, "register"]);

// Login
Route::post("login", [ApiController::class, "login"]);

// Obter níveis de acesso disponíveis
Route::get("access-levels", [ApiController::class, "getAccessLevels"]);

// Obter informações de redirecionamento para o usuário atual
Route::get("redirect-info", [ApiController::class, "getCurrentUserRedirectInfo"]);

// Reset de senha
Route::post("forgot-password", [ApiController::class, "forgotPassword"]);
Route::post("reset-password", [ApiController::class, "resetPassword"]);
Route::post("verify-reset-token", [ApiController::class, "verifyResetToken"]);


//Nesta rotas de baixo precisa estar autenticado para usa-lás
Route::group([
    "middleware" => ["auth:sanctum"]
], function () {
    // Profile
    Route::get("profile", [ApiController::class, "profile"]);

    // Logout
    Route::post("logout", [ApiController::class, "logout"]);
});
