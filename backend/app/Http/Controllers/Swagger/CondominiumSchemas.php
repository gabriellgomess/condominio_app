<?php

namespace App\Http\Controllers\Swagger;

/**
 * @OA\Schema(
 *     schema="Condominium",
 *     title="Condomínio",
 *     description="Modelo de dados para condomínio",
 *     @OA\Property(property="id", type="integer", example=1, description="ID único do condomínio"),
 *     @OA\Property(property="name", type="string", example="Residencial Jardim das Flores", description="Nome do condomínio"),
 *     @OA\Property(property="address", type="string", example="Rua das Flores, 123 - Jardim Botânico", description="Endereço completo"),
 *     @OA\Property(property="city", type="string", example="São Paulo", description="Cidade"),
 *     @OA\Property(property="state", type="string", example="SP", description="Estado"),
 *     @OA\Property(property="zip_code", type="string", example="01234-567", description="CEP"),
 *     @OA\Property(property="phone", type="string", example="(11) 1234-5678", description="Telefone"),
 *     @OA\Property(property="email", type="string", example="admin@jardimflores.com", description="Email"),
 *     @OA\Property(property="description", type="string", example="Condomínio residencial com área de lazer", description="Descrição"),
 *     @OA\Property(property="active", type="boolean", example=true, description="Status ativo/inativo"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z")
 * )
 */

/**
 * @OA\Schema(
 *     schema="Block",
 *     title="Bloco/Torre",
 *     description="Modelo de dados para bloco ou torre",
 *     @OA\Property(property="id", type="integer", example=1, description="ID único do bloco"),
 *     @OA\Property(property="condominium_id", type="integer", example=1, description="ID do condomínio"),
 *     @OA\Property(property="name", type="string", example="Torre A", description="Nome do bloco/torre"),
 *     @OA\Property(property="description", type="string", example="Torre principal com 20 andares", description="Descrição"),
 *     @OA\Property(property="floors", type="integer", example=20, description="Número de andares"),
 *     @OA\Property(property="units_per_floor", type="integer", example=4, description="Unidades por andar"),
 *     @OA\Property(property="active", type="boolean", example=true, description="Status ativo/inativo"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z")
 * )
 */

/**
 * @OA\Schema(
 *     schema="Unit",
 *     title="Unidade",
 *     description="Modelo de dados para unidade (apartamento/casa/sala)",
 *     @OA\Property(property="id", type="integer", example=1, description="ID único da unidade"),
 *     @OA\Property(property="condominium_id", type="integer", example=1, description="ID do condomínio"),
 *     @OA\Property(property="block_id", type="integer", nullable=true, example=1, description="ID do bloco (opcional)"),
 *     @OA\Property(property="number", type="string", example="101", description="Número da unidade"),
 *     @OA\Property(property="type", type="string", example="apartamento", description="Tipo: apartamento, casa, sala, loja"),
 *     @OA\Property(property="floor", type="integer", example=1, description="Andar"),
 *     @OA\Property(property="area", type="number", format="float", example=120.50, description="Área em m²"),
 *     @OA\Property(property="bedrooms", type="integer", example=3, description="Número de quartos"),
 *     @OA\Property(property="bathrooms", type="integer", example=2, description="Número de banheiros"),
 *     @OA\Property(property="status", type="string", example="available", description="Status: available, occupied, maintenance"),
 *     @OA\Property(property="description", type="string", example="Apartamento 101 no 1º andar", description="Descrição"),
 *     @OA\Property(property="active", type="boolean", example=true, description="Status ativo/inativo"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z")
 * )
 */

/**
 * @OA\Schema(
 *     schema="ParkingSpace",
 *     title="Vaga de Garagem",
 *     description="Modelo de dados para vaga de garagem",
 *     @OA\Property(property="id", type="integer", example=1, description="ID único da vaga"),
 *     @OA\Property(property="condominium_id", type="integer", example=1, description="ID do condomínio"),
 *     @OA\Property(property="unit_id", type="integer", nullable=true, example=1, description="ID da unidade (opcional)"),
 *     @OA\Property(property="number", type="string", example="V001", description="Número da vaga"),
 *     @OA\Property(property="type", type="string", example="car", description="Tipo: car, motorcycle, truck, bicycle"),
 *     @OA\Property(property="location", type="string", example="subsolo", description="Localização"),
 *     @OA\Property(property="area", type="number", format="float", example=12.50, description="Área em m²"),
 *     @OA\Property(property="status", type="string", example="available", description="Status: available, occupied, reserved, maintenance"),
 *     @OA\Property(property="description", type="string", example="Vaga V001 para carro", description="Descrição"),
 *     @OA\Property(property="covered", type="boolean", example=true, description="Coberta ou descoberta"),
 *     @OA\Property(property="active", type="boolean", example=true, description="Status ativo/inativo"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z")
 * )
 */

/**
 * @OA\Schema(
 *     schema="StorageUnit",
 *     title="Depósito/Box",
 *     description="Modelo de dados para depósito ou box",
 *     @OA\Property(property="id", type="integer", example=1, description="ID único do depósito"),
 *     @OA\Property(property="condominium_id", type="integer", example=1, description="ID do condomínio"),
 *     @OA\Property(property="unit_id", type="integer", nullable=true, example=1, description="ID da unidade (opcional)"),
 *     @OA\Property(property="number", type="string", example="D001", description="Número do depósito"),
 *     @OA\Property(property="type", type="string", example="storage", description="Tipo: storage, box, cellar, attic"),
 *     @OA\Property(property="location", type="string", example="subsolo", description="Localização"),
 *     @OA\Property(property="area", type="number", format="float", example=8.50, description="Área em m²"),
 *     @OA\Property(property="height", type="number", format="float", example=2.50, description="Altura em metros"),
 *     @OA\Property(property="status", type="string", example="available", description="Status: available, occupied, reserved, maintenance"),
 *     @OA\Property(property="description", type="string", example="Depósito D001", description="Descrição"),
 *     @OA\Property(property="climate_controlled", type="boolean", example=false, description="Controle de temperatura"),
 *     @OA\Property(property="active", type="boolean", example=true, description="Status ativo/inativo"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z")
 * )
 */

/**
 * @OA\Schema(
 *     schema="CondominiumWithRelations",
 *     title="Condomínio com Relacionamentos",
 *     description="Modelo de dados para condomínio incluindo relacionamentos",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/Condominium"),
 *         @OA\Schema(
 *             @OA\Property(property="blocks", type="array", @OA\Items(ref="#/components/schemas/Block")),
 *             @OA\Property(property="units", type="array", @OA\Items(ref="#/components/schemas/Unit")),
 *             @OA\Property(property="parking_spaces", type="array", @OA\Items(ref="#/components/schemas/ParkingSpace")),
 *             @OA\Property(property="storage_units", type="array", @OA\Items(ref="#/components/schemas/StorageUnit")),
 *             @OA\Property(property="stats", type="object",
 *                 @OA\Property(property="total_blocks", type="integer", example=3),
 *                 @OA\Property(property="total_units", type="integer", example=133),
 *                 @OA\Property(property="total_parking_spaces", type="integer", example=100),
 *                 @OA\Property(property="total_storage_units", type="integer", example=50),
 *                 @OA\Property(property="occupied_units", type="integer", example=45),
 *                 @OA\Property(property="available_units", type="integer", example=88)
 *             )
 *         )
 *     }
 * )
 */

/**
 * @OA\Schema(
 *     schema="Pagination",
 *     title="Paginação",
 *     description="Informações de paginação",
 *     @OA\Property(property="current_page", type="integer", example=1, description="Página atual"),
 *     @OA\Property(property="last_page", type="integer", example=5, description="Última página"),
 *     @OA\Property(property="per_page", type="integer", example=15, description="Itens por página"),
 *     @OA\Property(property="total", type="integer", example=75, description="Total de itens"),
 *     @OA\Property(property="from", type="integer", example=1, description="Primeiro item da página"),
 *     @OA\Property(property="to", type="integer", example=15, description="Último item da página")
 * )
 */

/**
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     title="Resposta de Erro",
 *     description="Modelo padrão para respostas de erro",
 *     @OA\Property(property="status", type="string", example="error", description="Status da resposta"),
 *     @OA\Property(property="message", type="string", example="Mensagem de erro", description="Descrição do erro"),
 *     @OA\Property(property="errors", type="object", description="Detalhes dos erros de validação")
 * )
 */

/**
 * @OA\Schema(
 *     schema="SuccessResponse",
 *     title="Resposta de Sucesso",
 *     description="Modelo padrão para respostas de sucesso",
 *     @OA\Property(property="status", type="string", example="success", description="Status da resposta"),
 *     @OA\Property(property="message", type="string", example="Operação realizada com sucesso", description="Mensagem de sucesso"),
 *     @OA\Property(property="data", type="object", description="Dados retornados")
 * )
 */

/**
 * @OA\Schema(
 *     schema="CondominiumListResponse",
 *     title="Resposta de Lista de Condomínios",
 *     description="Resposta para listagem de condomínios",
 *     @OA\Property(property="status", type="string", example="success", description="Status da resposta"),
 *     @OA\Property(property="message", type="string", example="Condomínios listados com sucesso", description="Mensagem"),
 *     @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Condominium"), description="Lista de condomínios"),
 *     @OA\Property(property="pagination", ref="#/components/schemas/Pagination", description="Informações de paginação")
 * )
 */

/**
 * @OA\Schema(
 *     schema="CondominiumCreateRequest",
 *     title="Requisição para Criar Condomínio",
 *     description="Dados necessários para criar um condomínio",
 *     required={"name", "address", "city", "state", "zip_code"},
 *     @OA\Property(property="name", type="string", example="Residencial Jardim das Flores", description="Nome do condomínio"),
 *     @OA\Property(property="address", type="string", example="Rua das Flores, 123 - Jardim Botânico", description="Endereço completo"),
 *     @OA\Property(property="city", type="string", example="São Paulo", description="Cidade"),
 *     @OA\Property(property="state", type="string", example="SP", description="Estado"),
 *     @OA\Property(property="zip_code", type="string", example="01234-567", description="CEP"),
 *     @OA\Property(property="phone", type="string", example="(11) 1234-5678", description="Telefone"),
 *     @OA\Property(property="email", type="string", example="admin@jardimflores.com", description="Email"),
 *     @OA\Property(property="description", type="string", example="Condomínio residencial com área de lazer", description="Descrição")
 * )
 */

/**
 * @OA\Schema(
 *     schema="CondominiumUpdateRequest",
 *     title="Requisição para Atualizar Condomínio",
 *     description="Dados opcionais para atualizar um condomínio",
 *     @OA\Property(property="name", type="string", example="Residencial Jardim das Flores", description="Nome do condomínio"),
 *     @OA\Property(property="address", type="string", example="Rua das Flores, 123 - Jardim Botânico", description="Endereço completo"),
 *     @OA\Property(property="city", type="string", example="São Paulo", description="Cidade"),
 *     @OA\Property(property="state", type="string", example="SP", description="Estado"),
 *     @OA\Property(property="zip_code", type="string", example="01234-567", description="CEP"),
 *     @OA\Property(property="phone", type="string", example="(11) 1234-5678", description="Telefone"),
 *     @OA\Property(property="email", type="string", example="admin@jardimflores.com", description="Email"),
 *     @OA\Property(property="description", type="string", example="Condomínio residencial com área de lazer", description="Descrição"),
 *     @OA\Property(property="active", type="boolean", example=true, description="Status ativo/inativo")
 * )
 */

/**
 * @OA\Schema(
 *     schema="CondominiumUpdateResponse",
 *     title="Resposta de Atualização de Condomínio",
 *     description="Resposta para atualização de condomínio",
 *     @OA\Property(property="status", type="string", example="success", description="Status da resposta"),
 *     @OA\Property(property="message", type="string", example="Condomínio atualizado com sucesso", description="Mensagem de sucesso"),
 *     @OA\Property(property="data", ref="#/components/schemas/Condominium", description="Dados do condomínio atualizado")
 * )
 */

/**
 * @OA\Schema(
 *     schema="CondominiumDeleteResponse",
 *     title="Resposta de Exclusão de Condomínio",
 *     description="Resposta para exclusão de condomínio",
 *     @OA\Property(property="status", type="string", example="success", description="Status da resposta"),
 *     @OA\Property(property="message", type="string", example="Condomínio excluído com sucesso", description="Mensagem de sucesso")
 * )
 */
