-- JPM Stock — Módulo 2: Cadastro de Produtos
-- Este schema assume que já existem tabelas empresas, usuarios e futuramente fornecedores.

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
  CONSTRAINT fk_produtos_categoria_empresa FOREIGN KEY (empresa_id, categoria_id)
    REFERENCES categorias (empresa_id, id)
);

CREATE INDEX idx_produtos_empresa ON produtos (empresa_id);
CREATE INDEX idx_produtos_empresa_categoria ON produtos (empresa_id, categoria_id);
CREATE INDEX idx_produtos_empresa_nome ON produtos (empresa_id, nome);
CREATE INDEX idx_produtos_empresa_codigo_barras ON produtos (empresa_id, codigo_barras);
