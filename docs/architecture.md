# Arquitetura do Módulo 2 — Cadastro de Produtos

## Visão geral

O Módulo 2 do JPM Stock foi desenhado como um módulo SaaS multiempresa. Cada entidade operacional contém `empresa_id` e todas as operações passam por uma função de escopo que compara o registro com a empresa ativa da sessão. Isso impede que uma empresa liste, edite ou remova produtos e categorias de outra empresa.

## Estrutura lógica

- **Sessão multiempresa:** `activeCompanyId` representa a empresa autenticada no momento.
- **Camada de validação:** valida campos obrigatórios, preços, quantidades, códigos duplicados dentro da mesma empresa e categoria pertencente à mesma empresa.
- **Camada de estado:** simula tabelas `produtos`, `categorias` e `alteracoes` em memória para permitir evolução futura para API REST ou GraphQL.
- **Camada de interface:** componentes de listagem, formulário, filtros, modais de confirmação e histórico são renderizados com base no escopo da empresa ativa.
- **Camada de auditoria:** alterações relevantes de preço, categoria, estoque mínimo e exclusão são registradas em `changeLog`.

## Segurança multiempresa

As regras aplicadas no front-end devem ser replicadas no backend:

1. Obter `empresa_id` somente do token/sessão autenticada.
2. Nunca aceitar `empresa_id` livre do corpo da requisição para alterar escopo.
3. Aplicar filtros por empresa em todas as consultas.
4. Validar que `categoria_id` e `fornecedor_id` pertencem à mesma empresa antes de vincular ao produto.
5. Usar índices únicos compostos por `empresa_id` para códigos internos.

## Preparação para futuras funcionalidades

A modelagem mantém campos e pontos de extensão para código de barras, QR Code, leitores externos, relatórios, inteligência artificial e controle automático de estoque. A exclusão atual é confirmada na interface e a tabela já prevê a inclusão futura de colunas de soft delete, como `data_exclusao` e `excluido_por`.
