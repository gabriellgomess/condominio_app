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
            margin-bottom: 20px;
        }
        
        .contract-info h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #333;
        }
        
        .info-row {
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
        }
        
        .info-value {
            display: inline-block;
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
        }
        
        .signature-box {
            width: 45%;
            text-align: center;
            padding: 20px;
            border: 1px solid #ccc;
            margin: 10px;
            display: inline-block;
            vertical-align: top;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            margin-top: 50px;
            height: 1px;
        }
        
        .status-badge {
            padding: 4px 8px;
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
        <div class="info-row">
            <span class="info-label">Número do Contrato:</span>
            <span class="info-value">{{ $contract_number }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Data de Geração:</span>
            <span class="info-value">{{ $generated_at }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">
                <span class="status-badge status-{{ $supplier->status }}">
                    {{ ucfirst($supplier->status) }}
                </span>
            </span>
        </div>
    </div>

    <div class="section">
        <h3>DADOS DO CONDOMÍNIO</h3>
        <div class="info-row">
            <span class="info-label">Nome:</span>
            <span class="info-value">{{ $condominium->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">CNPJ:</span>
            <span class="info-value">{{ $condominium->cnpj ?? 'Não informado' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Endereço:</span>
            <span class="info-value">
                {{ $condominium->address }}, {{ $condominium->number }}
                @if($condominium->complement)
                    - {{ $condominium->complement }}
                @endif
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">CEP:</span>
            <span class="info-value">{{ $condominium->cep }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Cidade/UF:</span>
            <span class="info-value">{{ $condominium->city }}/{{ $condominium->state }}</span>
        </div>
    </div>

    <div class="section">
        <h3>DADOS DO FORNECEDOR</h3>
        <div class="info-row">
            <span class="info-label">Razão Social:</span>
            <span class="info-value">{{ $supplier->company_name }}</span>
        </div>
        @if($supplier->trade_name)
        <div class="info-row">
            <span class="info-label">Nome Fantasia:</span>
            <span class="info-value">{{ $supplier->trade_name }}</span>
        </div>
        @endif
        <div class="info-row">
            <span class="info-label">Tipo:</span>
            <span class="info-value">{{ ucfirst($supplier->supplier_type) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Categoria:</span>
            <span class="info-value">{{ ucfirst(str_replace('_', ' ', $supplier->category)) }}</span>
        </div>
        @if($supplier->cnpj)
        <div class="info-row">
            <span class="info-label">CNPJ:</span>
            <span class="info-value">{{ $supplier->cnpj }}</span>
        </div>
        @endif
        @if($supplier->cpf)
        <div class="info-row">
            <span class="info-label">CPF:</span>
            <span class="info-value">{{ $supplier->cpf }}</span>
        </div>
        @endif
        <div class="info-row">
            <span class="info-label">Contato:</span>
            <span class="info-value">{{ $supplier->contact_name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">E-mail:</span>
            <span class="info-value">{{ $supplier->email }}</span>
        </div>
        @if($supplier->phone)
        <div class="info-row">
            <span class="info-label">Telefone:</span>
            <span class="info-value">{{ $supplier->phone }}</span>
        </div>
        @endif
        @if($supplier->mobile)
        <div class="info-row">
            <span class="info-label">Celular:</span>
            <span class="info-value">{{ $supplier->mobile }}</span>
        </div>
        @endif
        @if($supplier->evaluation)
        <div class="info-row">
            <span class="info-label">Avaliação:</span>
            <span class="info-value">
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
            </span>
        </div>
        @endif
    </div>

    @if($supplier->address)
    <div class="section">
        <h3>ENDEREÇO DO FORNECEDOR</h3>
        <div class="info-row">
            <span class="info-label">Endereço:</span>
            <span class="info-value">
                {{ $supplier->address }}, {{ $supplier->number }}
                @if($supplier->complement)
                    - {{ $supplier->complement }}
                @endif
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Bairro:</span>
            <span class="info-value">{{ $supplier->district }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">CEP:</span>
            <span class="info-value">{{ $supplier->cep }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Cidade/UF:</span>
            <span class="info-value">{{ $supplier->city }}/{{ $supplier->state }}</span>
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
        @if($supplier->hourly_rate)
        <div class="info-row">
            <span class="info-label">Valor Hora:</span>
            <span class="info-value">R$ {{ number_format($supplier->hourly_rate, 2, ',', '.') }}</span>
        </div>
        @endif
        @if($supplier->monthly_rate)
        <div class="info-row">
            <span class="info-label">Valor Mensal:</span>
            <span class="info-value">R$ {{ number_format($supplier->monthly_rate, 2, ',', '.') }}</span>
        </div>
        @endif
        @if($supplier->contract_start)
        <div class="info-row">
            <span class="info-label">Início do Contrato:</span>
            <span class="info-value">{{ \Carbon\Carbon::parse($supplier->contract_start)->format('d/m/Y') }}</span>
        </div>
        @endif
        @if($supplier->contract_end)
        <div class="info-row">
            <span class="info-label">Fim do Contrato:</span>
            <span class="info-value">{{ \Carbon\Carbon::parse($supplier->contract_end)->format('d/m/Y') }}</span>
        </div>
        @endif
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
        <div class="info-row">
            <span class="info-label">Contato:</span>
            <span class="info-value">{{ $supplier->emergency_contact }}</span>
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