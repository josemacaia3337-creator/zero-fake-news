# JPM Stock — Módulo 2: Cadastro de Produtos

JPM Stock é uma plataforma web SaaS multiempresa para gestão inteligente de estoque da JPM Tech Solutions. Este módulo implementa cadastro, categorias, consulta, edição e exclusão segura de produtos, respeitando o isolamento por empresa iniciado no módulo de autenticação e dashboard.

## Arquitetura escolhida

A implementação usa uma arquitetura front-end modular em HTML, CSS e JavaScript puro para demonstrar o fluxo funcional completo sem dependências externas. A camada de domínio mantém produtos e categorias sempre associados ao `empresa_id` da sessão ativa. A interface renderiza apenas dados filtrados pela empresa autenticada e todas as operações de criar, editar, remover e listar validam essa associação antes de alterar o estado.

Em produção, a mesma separação deve existir no backend: autenticação identifica a empresa ativa, repositórios aplicam `WHERE empresa_id = :empresa_id` e o banco usa chaves estrangeiras e índices compostos por empresa para impedir colisões entre tenants.

## Estrutura de pastas

```text
zero-fake-news/
├── database/
│   └── schema.sql              # Modelo relacional das tabelas produtos e categorias
├── docs/
│   └── architecture.md         # Explicação técnica do módulo multiempresa
├── frontend/
│   ├── index.html              # Interface web do JPM Stock
│   └── style.css               # Design responsivo e componentes reutilizáveis
├── index.html                  # Entrada estática alternativa na raiz
├── script.js                   # Estado, validações, CRUD e segurança por empresa
└── README.md                   # Documentação do módulo
```

## Modelo do banco de dados

### `categorias`

- `id`: chave primária.
- `empresa_id`: empresa proprietária da categoria.
- `nome`: nome único por empresa.
- `descricao`: descrição opcional.
- `data_criacao`: data de criação.

### `produtos`

- `id`: chave primária.
- `empresa_id`: empresa proprietária do produto.
- `categoria_id`: categoria da mesma empresa.
- `fornecedor_id`: fornecedor principal, preparado para integração futura.
- `nome`, `codigo_produto`, `codigo_barras`, `descricao`, `unidade_medida`.
- `preco_compra`, `preco_venda`, `quantidade_estoque`, `estoque_minimo`.
- `data_criacao`, `data_atualizacao`.

## Funcionalidades entregues

- Cadastro completo de produtos.
- CRUD de categorias.
- Lista com pesquisa por nome e código, filtro por categoria e ordenação.
- Edição de produto com registro de alterações importantes.
- Exclusão segura com confirmação e estrutura preparada para soft delete.
- Controle multiempresa no estado da aplicação e nas recomendações de schema.
- Interface responsiva para desktop e celular.

## Como executar

Abra `frontend/index.html` no navegador ou sirva a pasta com um servidor estático simples.
