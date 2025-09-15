<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Fornecedor - {{ $supplier->company_name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 18px;
            margin: 0;
            color: #333;
        }
        
        .header h2 {
            font-size: 14px;
            margin: 5px 0 0 0;
            color: #666;
            font-weight: normal;
        }
        
        .contract-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .contract-info h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #333;
        }
        
        .info-grid {
            display: table;
            width: 100%;
        }
        
        .info-row {
            display: table-row;
        }
        
        .info-label {
            display: table-cell;
            font-weight: bold;
            padding: 5px 10px 5px 0;
            width: 30%;
            vertical-align: top;
        }
        
        .info-value {
            display: table-cell;
            padding: 5px 0;
            width: 70%;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section h3 {
            font-size: 14px;
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        
        .two-columns {
            display: table;
            width: 100%;
        }
        
        .column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 20px;
        }
        
        .column:last-child {
            padding-right: 0;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        
        .signature-section {
            margin-top: 40px;
            display: table;
            width: 100%;
        }
        
        .signature-box {
            display: table-cell;
            width: 45%;
            text-align: center;
            padding: 20px;
            border: 1px solid #ccc;
            margin: 10px;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            margin-top: 50px;
            height: 1px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-active {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-inactive {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-blocked {
            background-color: #f5c6cb;
            color: #721c24;
        }
        
        .evaluation-stars {
            color: #ffc107;
            font-size: 14px;
        }
        
        .contract-terms {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #333;
            margin: 20px 0;
        }
        
        .contract-terms h4 {
            margin: 0 0 10px 0;
            font-size: 13px;
            color: #333;
        }
        
        .contract-terms ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .contract-terms li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
        <h2>Sistema de Gestão Condominial</h2>
    </div>

    <div class="contract-info">
        <h3>Informações do Contrato</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Número do Contrato:</div>
                <div class="info-value">{{ $contract_number }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Data de Geração:</div>
                <div class="info-value">{{ $generated_at }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Status:</div>
                <div class="info-value">
                    <span class="status-badge status-{{ $supplier->status }}">
                        {{ ucfirst($supplier->status) }}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>DADOS DO CONDOMÍNIO</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Nome:</div>
                <div class="info-value">{{ $condominium->name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">CNPJ:</div>
                <div class="info-value">{{ $condominium->cnpj ?? 'Não informado' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Endereço:</div>
                <div class="info-value">
                    {{ $condominium->address }}, {{ $condominium->number }}
                    @if($condominium->complement)
                        - {{ $condominium->complement }}
                    @endif
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">CEP:</div>
                <div class="info-value">{{ $condominium->cep }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Cidade/UF:</div>
                <div class="info-value">{{ $condominium->city }}/{{ $condominium->state }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>DADOS DO FORNECEDOR</h3>
        <div class="two-columns">
            <div class="column">
                <div class="info-grid">
                    <div class="info-row">
                        <div class="info-label">Razão Social:</div>
                        <div class="info-value">{{ $supplier->company_name }}</div>
                    </div>
                    @if($supplier->trade_name)
                    <div class="info-row">
                        <div class="info-label">Nome Fantasia:</div>
                        <div class="info-value">{{ $supplier->trade_name }}</div>
                    </div>
                    @endif
                    <div class="info-row">
                        <div class="info-label">Tipo:</div>
                        <div class="info-value">{{ ucfirst($supplier->supplier_type) }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Categoria:</div>
                        <div class="info-value">{{ ucfirst(str_replace('_', ' ', $supplier->category)) }}</div>
                    </div>
                    @if($supplier->cnpj)
                    <div class="info-row">
                        <div class="info-label">CNPJ:</div>
                        <div class="info-value">{{ $supplier->cnpj }}</div>
                    </div>
                    @endif
                    @if($supplier->cpf)
                    <div class="info-row">
                        <div class="info-label">CPF:</div>
                        <div class="info-value">{{ $supplier->cpf }}</div>
                    </div>
                    @endif
                </div>
            </div>
            <div class="column">
                <div class="info-grid">
                    <div class="info-row">
                        <div class="info-label">Contato:</div>
                        <div class="info-value">{{ $supplier->contact_name }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">E-mail:</div>
                        <div class="info-value">{{ $supplier->email }}</div>
                    </div>
                    @if($supplier->phone)
                    <div class="info-row">
                        <div class="info-label">Telefone:</div>
                        <div class="info-value">{{ $supplier->phone }}</div>
                    </div>
                    @endif
                    @if($supplier->mobile)
                    <div class="info-row">
                        <div class="info-label">Celular:</div>
                        <div class="info-value">{{ $supplier->mobile }}</div>
                    </div>
                    @endif
                    @if($supplier->evaluation)
                    <div class="info-row">
                        <div class="info-label">Avaliação:</div>
                        <div class="info-value">
                            <span class="evaluation-stars">
                                @for($i = 1; $i <= 5; $i++)
                                    @if($i <= $supplier->evaluation)
                                        ★
                                    @else
                                        ☆
                                    @endif
                                @endfor
                            </span>
                            ({{ number_format($supplier->evaluation, 1) }}/5)
                        </div>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    @if($supplier->address)
    <div class="section">
        <h3>ENDEREÇO DO FORNECEDOR</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Endereço:</div>
                <div class="info-value">
                    {{ $supplier->address }}, {{ $supplier->number }}
                    @if($supplier->complement)
                        - {{ $supplier->complement }}
                    @endif
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Bairro:</div>
                <div class="info-value">{{ $supplier->district }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">CEP:</div>
                <div class="info-value">{{ $supplier->cep }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Cidade/UF:</div>
                <div class="info-value">{{ $supplier->city }}/{{ $supplier->state }}</div>
            </div>
        </div>
    </div>
    @endif

    @if($supplier->services_description)
    <div class="section">
        <h3>DESCRIÇÃO DOS SERVIÇOS</h3>
        <div class="contract-terms">
            <p>{{ $supplier->services_description }}</p>
        </div>
    </div>
    @endif

    <div class="section">
        <h3>VALORES E CONTRATO</h3>
        <div class="two-columns">
            <div class="column">
                <div class="info-grid">
                    @if($supplier->hourly_rate)
                    <div class="info-row">
                        <div class="info-label">Valor Hora:</div>
                        <div class="info-value">R$ {{ number_format($supplier->hourly_rate, 2, ',', '.') }}</div>
                    </div>
                    @endif
                    @if($supplier->monthly_rate)
                    <div class="info-row">
                        <div class="info-label">Valor Mensal:</div>
                        <div class="info-value">R$ {{ number_format($supplier->monthly_rate, 2, ',', '.') }}</div>
                    </div>
                    @endif
                </div>
            </div>
            <div class="column">
                <div class="info-grid">
                    @if($supplier->contract_start)
                    <div class="info-row">
                        <div class="info-label">Início do Contrato:</div>
                        <div class="info-value">{{ \Carbon\Carbon::parse($supplier->contract_start)->format('d/m/Y') }}</div>
                    </div>
                    @endif
                    @if($supplier->contract_end)
                    <div class="info-row">
                        <div class="info-label">Fim do Contrato:</div>
                        <div class="info-value">{{ \Carbon\Carbon::parse($supplier->contract_end)->format('d/m/Y') }}</div>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    @if($supplier->notes)
    <div class="section">
        <h3>OBSERVAÇÕES</h3>
        <div class="contract-terms">
            <p>{{ $supplier->notes }}</p>
        </div>
    </div>
    @endif

    @if($supplier->emergency_contact)
    <div class="section">
        <h3>CONTATO DE EMERGÊNCIA</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Contato:</div>
                <div class="info-value">{{ $supplier->emergency_contact }}</div>
            </div>
        </div>
    </div>
    @endif

    <div class="contract-terms">
        <h4>TERMOS E CONDIÇÕES</h4>
        <ul>
            <li>Este documento representa um contrato preliminar baseado nas informações cadastradas no sistema.</li>
            <li>O contrato oficial será elaborado pelo departamento jurídico.</li>
            <li>Os valores apresentados são referenciais e podem ser ajustados conforme negociação.</li>
            <li>O fornecedor deve manter todas as documentações em dia conforme legislação vigente.</li>
            <li>Qualquer alteração nos termos deve ser comunicada previamente.</li>
        </ul>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <p><strong>CONDOMÍNIO</strong></p>
            <p>{{ $condominium->name }}</p>
            <div class="signature-line"></div>
            <p>Responsável Legal</p>
        </div>
        
        <div class="signature-box">
            <p><strong>FORNECEDOR</strong></p>
            <p>{{ $supplier->company_name }}</p>
            <div class="signature-line"></div>
            <p>{{ $supplier->contact_name }}</p>
        </div>
    </div>

    <div class="footer">
        <p>Documento gerado automaticamente pelo Sistema de Gestão Condominial em {{ $generated_at }}</p>
        <p>Este é um documento preliminar. O contrato oficial será fornecido pelo departamento jurídico.</p>
    </div>
</body>
</html>


