<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Finance - Stage 1
use App\Http\Controllers\Finance\SubaccountController;
use App\Http\Controllers\Finance\CategoryController;
use App\Http\Controllers\Finance\RevenueController;
use App\Http\Controllers\Finance\ExpenseController;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('finance/subaccounts', SubaccountController::class);
    Route::apiResource('finance/categories', CategoryController::class);
    Route::get('finance/subaccounts/{subaccount}/categories', [CategoryController::class, 'getBySubaccount']);
    Route::apiResource('finance/revenues', RevenueController::class);
    Route::apiResource('finance/expenses', ExpenseController::class);
});

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
use App\Http\Controllers\Space\SpaceController;
use App\Http\Controllers\Resident\ResidentController;
use App\Http\Controllers\Reservation\ReservationConfigController;
use App\Http\Controllers\Reservation\ReservationController;
use App\Http\Controllers\Supplier\SupplierController;
use App\Http\Controllers\Announcement\AnnouncementController;
use App\Http\Controllers\Incident\IncidentController;
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

// Contrato de fornecedor (rota pública para visualização)
Route::get("suppliers/{id}/contract", [SupplierController::class, "generateContract"]);


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

    // Configurações de Reserva
    Route::apiResource('condominiums.reservation-configs', ReservationConfigController::class)->except(['show', 'update', 'destroy']);
    Route::apiResource('reservation-configs', ReservationConfigController::class)->only(['show', 'update', 'destroy']);
    Route::get('condominiums/{condominium_id}/reservable-spaces', [ReservationConfigController::class, 'getReservableSpaces']);

    // Reservas
    Route::apiResource('reservations', ReservationController::class);
    Route::get('condominiums/{condominium_id}/reservations', [ReservationController::class, 'index']);
    Route::get('spaces/{space_id}/availability', [ReservationController::class, 'checkAvailability']);
    Route::get('spaces/{space_id}/availability-config', [ReservationController::class, 'getAvailabilityConfig']);
    Route::put('reservations/{id}/confirm', [ReservationController::class, 'confirm']);

    // Moradores (Proprietários + Inquilinos)
    Route::apiResource('residents', ResidentController::class);
    Route::get('condominiums/{condominium_id}/residents', [ResidentController::class, 'index']);
    Route::get('condominiums/{condominium_id}/residents/stats', [ResidentController::class, 'stats']);

    // Fornecedores
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('condominiums/{condominium_id}/suppliers', [SupplierController::class, 'index']);
    Route::get('suppliers/category/{category}', [SupplierController::class, 'getByCategory']);
    Route::post('suppliers/{id}/evaluate', [SupplierController::class, 'evaluate']);
    Route::get('suppliers-stats', [SupplierController::class, 'getStats']);
    Route::get('supplier-categories', [SupplierController::class, 'getCategories']);
    Route::get('supplier-types', [SupplierController::class, 'getSupplierTypes']);

    // Comunicados
    Route::apiResource('announcements', AnnouncementController::class);
    Route::get('condominiums/{condominium_id}/announcements', [AnnouncementController::class, 'index']);
    Route::post('announcements/{id}/publish', [AnnouncementController::class, 'publish']);
    Route::post('announcements/{id}/unpublish', [AnnouncementController::class, 'unpublish']);
    Route::post('announcements/{id}/archive', [AnnouncementController::class, 'archive']);
    Route::get('announcements-stats', [AnnouncementController::class, 'stats']);

    // Ocorrências
    Route::apiResource('incidents', IncidentController::class);
    Route::get('condominiums/{condominium_id}/incidents', [IncidentController::class, 'index']);
    Route::get('condominiums/{condominium_id}/incidents/stats', [IncidentController::class, 'stats']);
    Route::get('incidents-stats', [IncidentController::class, 'stats']);
    Route::get('incident-types', [IncidentController::class, 'getTypes']);
    Route::get('incident-priorities', [IncidentController::class, 'getPriorities']);
    Route::get('incident-statuses', [IncidentController::class, 'getStatuses']);

    // Ocorrências do morador logado (mobile app)
    Route::get('my-incidents', [IncidentController::class, 'myIncidents']);
    Route::get('my-incidents-stats', [IncidentController::class, 'myStats']);

    // Troca de senha
    Route::post('change-password', [ApiController::class, 'changePassword']);
});
