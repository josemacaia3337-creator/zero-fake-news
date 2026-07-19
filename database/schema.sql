-- JPM Stock — Módulo 3: Cadastro de Fornecedores
-- Este schema assume que já existem tabelas empresas e usuarios.
-- Todas as entidades operacionais possuem empresa_id para isolamento multiempresa.

CREATE TABLE categorias (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_categorias_empresa_nome UNIQUE (empresa_id, nome),
  CONSTRAINT uq_categorias_empresa_id UNIQUE (empresa_id, id)
);

CREATE INDEX idx_categorias_empresa ON categorias (empresa_id);

CREATE TABLE categorias_fornecedor (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_categorias_fornecedor_empresa_nome UNIQUE (empresa_id, nome),
  CONSTRAINT uq_categorias_fornecedor_empresa_id UNIQUE (empresa_id, id)
);

CREATE INDEX idx_categorias_fornecedor_empresa ON categorias_fornecedor (empresa_id);

CREATE TABLE fornecedores (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id BIGINT,
  nome_empresa VARCHAR(180) NOT NULL,
  nome_responsavel VARCHAR(160) NOT NULL,
  nif VARCHAR(60) NOT NULL,
  telefone VARCHAR(40) NOT NULL,
  email VARCHAR(160),
  endereco TEXT,
  cidade VARCHAR(120),
  pais VARCHAR(120),
  observacoes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'ativo',
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_exclusao TIMESTAMPTZ,
  CONSTRAINT uq_fornecedores_empresa_nif UNIQUE (empresa_id, nif),
  CONSTRAINT fk_fornecedores_categoria_empresa FOREIGN KEY (empresa_id, categoria_id)
    REFERENCES categorias_fornecedor (empresa_id, id),
  CONSTRAINT ck_fornecedores_status CHECK (status IN ('ativo', 'inativo', 'bloqueado'))
);

CREATE INDEX idx_fornecedores_empresa ON fornecedores (empresa_id) WHERE data_exclusao IS NULL;
CREATE INDEX idx_fornecedores_empresa_categoria ON fornecedores (empresa_id, categoria_id) WHERE data_exclusao IS NULL;
CREATE INDEX idx_fornecedores_empresa_nome ON fornecedores (empresa_id, nome_empresa) WHERE data_exclusao IS NULL;
CREATE INDEX idx_fornecedores_empresa_telefone ON fornecedores (empresa_id, telefone) WHERE data_exclusao IS NULL;

CREATE TABLE produtos (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id BIGINT,
  fornecedor_id BIGINT,
  nome VARCHAR(160) NOT NULL,
  codigo_produto VARCHAR(80) NOT NULL,
  codigo_barras VARCHAR(80),
  descricao TEXT,
  unidade_medida VARCHAR(20) NOT NULL,
  preco_compra NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (preco_compra >= 0),
  preco_venda NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (preco_venda >= 0),
  quantidade_estoque NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (quantidade_estoque >= 0),
  estoque_minimo NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_produtos_empresa_codigo UNIQUE (empresa_id, codigo_produto),
  CONSTRAINT uq_produtos_empresa_id UNIQUE (empresa_id, id),
  CONSTRAINT fk_produtos_categoria_empresa FOREIGN KEY (empresa_id, categoria_id)
    REFERENCES categorias (empresa_id, id),
  CONSTRAINT fk_produtos_fornecedor_empresa FOREIGN KEY (empresa_id, fornecedor_id)
    REFERENCES fornecedores (empresa_id, id)
);

CREATE INDEX idx_produtos_empresa ON produtos (empresa_id);
CREATE INDEX idx_produtos_empresa_categoria ON produtos (empresa_id, categoria_id);
CREATE INDEX idx_produtos_empresa_fornecedor ON produtos (empresa_id, fornecedor_id);
CREATE INDEX idx_produtos_empresa_nome ON produtos (empresa_id, nome);
CREATE INDEX idx_produtos_empresa_codigo_barras ON produtos (empresa_id, codigo_barras);

-- Preparação futura: habilita múltiplos fornecedores por produto sem afetar o fornecedor principal.
CREATE TABLE produtos_fornecedores (
  produto_id BIGINT NOT NULL,
  fornecedor_id BIGINT NOT NULL,
  empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  principal BOOLEAN NOT NULL DEFAULT FALSE,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (produto_id, fornecedor_id),
  CONSTRAINT fk_produtos_fornecedores_produto_empresa FOREIGN KEY (empresa_id, produto_id)
    REFERENCES produtos (empresa_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_produtos_fornecedores_fornecedor_empresa FOREIGN KEY (empresa_id, fornecedor_id)
    REFERENCES fornecedores (empresa_id, id)
);

CREATE INDEX idx_produtos_fornecedores_empresa ON produtos_fornecedores (empresa_id);
