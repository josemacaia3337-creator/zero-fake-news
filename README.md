# Zero Fake News

Zero Fake News é uma plataforma em fase de MVP focada em combater a desinformação em Angola. A proposta inicial é oferecer uma interface web leve, responsiva e acessível para apoiar utilizadores na análise preliminar de notícias, mensagens virais e publicações partilhadas em redes sociais.

> **Nota:** esta versão não substitui uma verificação jornalística profissional. O MVP simula critérios de validação para demonstrar o fluxo de produto e preparar futuras integrações com bases de dados, serviços de fact-checking e modelos de IA.

## Objetivos do MVP

- Permitir que o utilizador cole ou escreva uma notícia para análise.
- Simular uma avaliação de credibilidade com critérios transparentes.
- Apresentar recomendações práticas para verificação adicional.
- Manter a aplicação simples, rápida e executável diretamente no navegador.
- Criar uma base técnica fácil de evoluir para integrações reais no futuro.

## Plano de ficheiros

```text
zero-fake-news/
├── index.html   # Estrutura da interface de utilizador e conteúdo principal
├── style.css    # Design visual, layout responsivo e estados dos resultados
├── script.js    # Processamento do texto e simulação dos critérios de validação
└── README.md    # Documentação da arquitetura inicial do MVP
```

## Arquitetura inicial

A arquitetura inicial foi desenhada como uma aplicação estática de front-end para reduzir dependências e acelerar a validação da experiência de uso.

### 1. Camada de interface — `index.html`

Responsável por organizar a experiência do utilizador:

- Cabeçalho com proposta de valor da plataforma.
- Formulário com campo de texto para inserir a notícia.
- Botão para executar a análise e botão para limpar os dados.
- Área de resultado com pontuação de credibilidade.
- Lista de critérios avaliados e recomendações de próximos passos.

### 2. Camada visual — `style.css`

Responsável por garantir uma apresentação limpa e profissional:

- Layout responsivo para telemóveis, tablets e desktop.
- Paleta visual sóbria, associada a confiança e informação pública.
- Cartões para destacar métricas, critérios e recomendações.
- Estados visuais para risco baixo, médio e alto.

### 3. Camada de lógica — `script.js`

Responsável por processar a entrada do utilizador no navegador:

- Valida se há texto suficiente para análise.
- Calcula uma pontuação simulada de credibilidade.
- Avalia sinais como comprimento do texto, linguagem sensacionalista, presença de fontes, datas, links e termos verificáveis.
- Gera uma classificação resumida e recomendações de verificação.

## Critérios simulados de validação

O MVP usa regras simples e transparentes para demonstrar como a plataforma pode evoluir:

| Critério | O que observa | Impacto esperado |
| --- | --- | --- |
| Clareza do conteúdo | Texto com contexto suficiente | Aumenta a confiança |
| Indicação de fonte | Menções a entidades, links ou referências | Aumenta a confiança |
| Linguagem sensacionalista | Uso de urgência, choque ou chamadas virais | Reduz a confiança |
| Presença de datas | Indícios temporais para contextualização | Aumenta a confiança |
| Termos verificáveis | Lugares, instituições e factos concretos | Aumenta a confiança |

## Próximos passos sugeridos

- Integrar APIs de fact-checking e fontes oficiais de Angola.
- Criar um backend para histórico de análises e auditoria de resultados.
- Adicionar modelos de IA para classificação semântica e deteção de padrões de manipulação.
- Suportar upload de imagens e análise de publicações multimédia.
- Incluir localização em português de Angola e exemplos adaptados ao contexto nacional.
