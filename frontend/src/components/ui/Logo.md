# Componente Logo

O componente `Logo` é responsivo e se adapta automaticamente ao contexto da aplicação.

## Uso

```jsx
import Logo from '../components/ui/Logo';

// Logo horizontal pequeno para sidebar
<Logo variant="horizontal" size="small" theme="dark" />

// Logo horizontal grande para páginas principais
<Logo variant="horizontal" size="large" theme="dark" />

// Apenas o ícone
<Logo variant="icon" size="medium" theme="auto" />
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `variant` | `'horizontal' \| 'icon' \| 'compact'` | `'horizontal'` | Tipo de logo a exibir |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamanho do logo |
| `theme` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Tema do logo (cor) |
| `className` | `string` | `''` | Classes CSS adicionais |
| `onClick` | `function` | `null` | Função de clique (opcional) |

## Variações de Logo

### Horizontal
- **Branco e Laranja**: Para fundos escuros
- **Branco**: Para fundos escuros (versão minimalista)

### Ícone
- **Quadrado com fundo laranja**: Para favicons e ícones de app

## Responsividade

O componente se adapta automaticamente:
- **Mobile**: Usa versões menores (200px)
- **Desktop**: Usa versões maiores (500px)
- **Tamanhos**: small (h-6), medium (h-8), large (h-12)

## Integração Atual

✅ **Sidebar**: Logo horizontal pequeno com tema escuro
✅ **Login**: Logo horizontal médio com tema claro
✅ **Dashboard**: Logo horizontal grande com tema escuro
✅ **Favicon**: Ícone do sistema
✅ **Título**: "SíndicoApp - Gestão de Condomínio"
