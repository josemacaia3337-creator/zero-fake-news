# Arquitetura do Módulo 3 — Cadastro de Fornecedores

## Visão geral

O Módulo 3 do JPM Stock mantém a arquitetura SaaS multiempresa já utilizada em produtos. Cada fornecedor e categoria de fornecedor possui `empresa_id`, e a interface nunca renderiza registros fora da empresa ativa da sessão. As mesmas regras devem ser aplicadas no backend/API: o `empresa_id` vem da autenticação, não do corpo das requisições.

## Estrutura de pastas

```text
zero-fake-news/
├── database/
│   └── schema.sql          # Modelo relacional com fornecedores, categorias e vínculos futuros
├── docs/
│   └── architecture.md     # Decisões de arquitetura multiempresa do módulo
├── frontend/
│   ├── index.html          # Espelho de interface para deploy em subpasta
│   └── style.css           # Espelho dos estilos globais
├── index.html              # Interface principal do JPM Stock
├── script.js               # Estado simulado, validações, filtros e ações CRUD
└── style.css               # Design responsivo e componentes reutilizáveis
```

## Camadas lógicas

- **Sessão multiempresa:** `activeCompanyId` simula a empresa autenticada. A função `companyScoped` filtra fornecedores, categorias, produtos e auditoria por `empresa_id`.
- **Gestão de fornecedores:** formulário único para criação e edição, lista com pesquisa por nome/telefone, filtro por categoria, ordenação e perfil detalhado.
- **Categorias de fornecedores:** CRUD simples de categorias com validação de duplicidade por empresa e bloqueio de remoção quando há fornecedores associados.
- **Exclusão segura:** a interface exige confirmação e marca `data_exclusao`, preparando soft delete sem remover produtos ou histórico relacionado.
- **Integração com produtos:** produtos mantêm `fornecedor_id` para fornecedor principal e o banco inclui `produtos_fornecedores` para múltiplos fornecedores no futuro.

## Modelo do banco de dados

- `categorias_fornecedor`: categorias isoladas por empresa, com nome único por `empresa_id`.
- `fornecedores`: cadastro cadastral completo, status controlado, NIF único por empresa, soft delete por `data_exclusao` e chave estrangeira composta para garantir que a categoria pertence à mesma empresa.
- `produtos`: agora possui chave estrangeira composta para validar o fornecedor principal dentro da mesma empresa.
- `produtos_fornecedores`: tabela de junção preparada para múltiplos fornecedores por produto, com flag `principal` para evolução futura.

## Segurança e evolução futura

As consultas produtivas devem sempre usar `WHERE empresa_id = :empresa_id_autenticado AND data_exclusao IS NULL` para fornecedores. Atualizações e exclusões devem validar posse do registro pela empresa ativa antes de qualquer alteração. O desenho suporta módulos futuros de compras, entrada de mercadorias, histórico, avaliação de desempenho e recomendações por IA sem alterar o isolamento multiempresa.
