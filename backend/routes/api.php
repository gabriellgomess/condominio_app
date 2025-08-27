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

// Controllers do Sistema de Condomínio
use App\Http\Controllers\Condominium\CondominiumController;
use App\Http\Controllers\Block\BlockController;
use App\Http\Controllers\Unit\UnitController;
use App\Http\Controllers\ParkingSpace\ParkingSpaceController;
use App\Http\Controllers\StorageUnit\StorageUnitController;
use App\Http\Controllers\Resident\ResidentController;
use App\Http\Controllers\Api\CepController;


// Rotas públicas - não precisam de autenticação
// Register
Route::post("register", [ApiController::class, "register"]);

// Login
Route::post("login", [ApiController::class, "login"]);

// Obter níveis de acesso disponíveis
Route::get("access-levels", [ApiController::class, "getAccessLevels"]);

// Reset de senha
Route::post("forgot-password", [ApiController::class, "forgotPassword"]);
Route::post("reset-password", [ApiController::class, "resetPassword"]);
Route::post("verify-reset-token", [ApiController::class, "verifyResetToken"]);

// Busca de CEP (rota pública)
Route::get("cep/{cep}", [CepController::class, "search"]);
Route::post("cep/search", [CepController::class, "searchPost"]);


//Nesta rotas de baixo precisa estar autenticado para usa-lás
Route::group([
    "middleware" => ["auth:sanctum"]
], function () {
    // Profile
    Route::get("profile", [ApiController::class, "profile"]);

    // Obter informações de redirecionamento para o usuário atual
    Route::get("redirect-info", [ApiController::class, "getCurrentUserRedirectInfo"]);

    // Logout
    Route::post("logout", [ApiController::class, "logout"]);

    // Sistema de Condomínio
    Route::apiResource('condominiums', CondominiumController::class);

    // Endpoint unificado para carregar toda a estrutura
    Route::get('structure/complete', [CondominiumController::class, 'getCompleteStructure']);

    // Blocos/Torres
    Route::apiResource('condominiums.blocks', BlockController::class)->except(['show', 'update', 'destroy']);
    Route::apiResource('blocks', BlockController::class)->only(['show', 'update', 'destroy']);
    Route::get('condominiums/{condominium_id}/blocks/stats', [BlockController::class, 'stats']);

    // Unidades
    Route::apiResource('condominiums.units', UnitController::class)->except(['show', 'update', 'destroy']);
    Route::apiResource('units', UnitController::class)->only(['show', 'update', 'destroy']);

    // Vagas de Garagem
    Route::apiResource('condominiums.parking-spaces', ParkingSpaceController::class)->except(['show', 'update', 'destroy']);
    Route::apiResource('parking-spaces', ParkingSpaceController::class)->only(['show', 'update', 'destroy']);
    Route::get('condominiums/{condominium_id}/parking-spaces/stats', [ParkingSpaceController::class, 'stats']);

    // Depósitos
    Route::apiResource('condominiums.storage-units', StorageUnitController::class)->except(['show', 'update', 'destroy']);
    Route::apiResource('storage-units', StorageUnitController::class)->only(['show', 'update', 'destroy']);
    Route::get('condominiums/{condominium_id}/storage-units/stats', [StorageUnitController::class, 'stats']);

    // Moradores (Proprietários + Inquilinos)
    Route::apiResource('residents', ResidentController::class);
    Route::get('condominiums/{condominium_id}/residents', [ResidentController::class, 'index']);
    Route::get('condominiums/{condominium_id}/residents/stats', [ResidentController::class, 'stats']);
});
