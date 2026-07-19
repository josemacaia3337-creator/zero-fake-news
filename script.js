const companies = [
  { id: 1, name: 'Mercado Kilamba' },
  { id: 2, name: 'Farmácia Atlântico' },
];

let activeCompanyId = 1;
let deleteTargetId = null;

const state = {
  categories: [
    { id: 1, empresa_id: 1, nome: 'Bebidas', descricao: 'Águas, sumos e refrigerantes', data_criacao: '2026-07-01' },
    { id: 2, empresa_id: 1, nome: 'Alimentação', descricao: 'Produtos alimentares em geral', data_criacao: '2026-07-01' },
    { id: 3, empresa_id: 1, nome: 'Higiene', descricao: 'Higiene pessoal e limpeza', data_criacao: '2026-07-02' },
    { id: 4, empresa_id: 2, nome: 'Medicamentos', descricao: 'Produtos farmacêuticos', data_criacao: '2026-07-03' },
  ],
  products: [
    { id: 1, empresa_id: 1, categoria_id: 2, fornecedor_id: null, fornecedor_nome: 'AgroDistribuição Lda', nome: 'Arroz agulha 5kg', codigo_produto: 'ALI-001', codigo_barras: '5601000000012', descricao: 'Saco de arroz branco tipo agulha.', unidade_medida: 'pct', preco_compra: 3500, preco_venda: 4550, quantidade_estoque: 42, estoque_minimo: 12, data_criacao: '2026-07-10', data_atualizacao: '2026-07-10' },
    { id: 2, empresa_id: 1, categoria_id: 1, fornecedor_id: null, fornecedor_nome: 'Bebidas Sul', nome: 'Água mineral 1.5L', codigo_produto: 'BEB-014', codigo_barras: '5601000000142', descricao: 'Garrafa de água mineral sem gás.', unidade_medida: 'un', preco_compra: 180, preco_venda: 260, quantidade_estoque: 8, estoque_minimo: 20, data_criacao: '2026-07-11', data_atualizacao: '2026-07-12' },
    { id: 3, empresa_id: 2, categoria_id: 4, fornecedor_id: null, fornecedor_nome: 'Saúde Global', nome: 'Paracetamol 500mg', codigo_produto: 'MED-001', codigo_barras: '7890000001110', descricao: 'Caixa com comprimidos.', unidade_medida: 'cx', preco_compra: 900, preco_venda: 1250, quantidade_estoque: 120, estoque_minimo: 25, data_criacao: '2026-07-12', data_atualizacao: '2026-07-12' },
  ],
  changeLog: [],
};

const $ = (selector) => document.querySelector(selector);
const companyScoped = (items) => items.filter((item) => item.empresa_id === activeCompanyId);
const today = () => new Date().toISOString().slice(0, 10);
const money = (value) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(value).replace('AOA', 'Kz');
const nextId = (items) => Math.max(0, ...items.map((item) => item.id)) + 1;

function init() {
  $('#companySwitcher').innerHTML = companies.map((company) => `<option value="${company.id}">${company.name}</option>`).join('');
  $('#companySwitcher').value = String(activeCompanyId);
  bindEvents();
  renderAll();
}

function bindEvents() {
  $('#companySwitcher').addEventListener('change', (event) => {
    activeCompanyId = Number(event.target.value);
    resetProductForm();
    resetCategoryForm();
    renderAll();
  });
  $('#productForm').addEventListener('submit', saveProduct);
  $('#cancelEdit').addEventListener('click', resetProductForm);
  $('#categoryForm').addEventListener('submit', saveCategory);
  $('#cancelCategoryEdit').addEventListener('click', resetCategoryForm);
  ['#searchName', '#searchCode', '#categoryFilter', '#sortProducts'].forEach((selector) => $(selector).addEventListener('input', renderProducts));
  $('#confirmDelete').addEventListener('click', confirmDeleteProduct);
  $('#cancelDelete').addEventListener('click', closeDeleteModal);
}

function renderAll() {
  renderCategoryOptions();
  renderProducts();
  renderCategories();
  renderMetrics();
  renderChangeLog();
}

function renderCategoryOptions() {
  const categories = companyScoped(state.categories);
  const options = categories.map((category) => `<option value="${category.id}">${category.nome}</option>`).join('');
  $('#categoryId').innerHTML = `<option value="">Selecione</option>${options}`;
  $('#categoryFilter').innerHTML = `<option value="">Todas as categorias</option>${options}`;
}

function getCategoryName(categoryId) {
  return companyScoped(state.categories).find((category) => category.id === Number(categoryId))?.nome || 'Sem categoria';
}

function stockStatus(product) {
  if (product.quantidade_estoque <= 0) return ['Esgotado', 'out'];
  if (product.quantidade_estoque <= product.estoque_minimo) return ['Baixo estoque', 'low'];
  return ['Disponível', 'ok'];
}

function renderProducts() {
  const name = $('#searchName').value.trim().toLowerCase();
  const code = $('#searchCode').value.trim().toLowerCase();
  const category = Number($('#categoryFilter').value || 0);
  const sort = $('#sortProducts').value;
  const products = companyScoped(state.products)
    .filter((product) => product.nome.toLowerCase().includes(name))
    .filter((product) => product.codigo_produto.toLowerCase().includes(code) || (product.codigo_barras || '').toLowerCase().includes(code))
    .filter((product) => !category || product.categoria_id === category)
    .sort((a, b) => typeof a[sort] === 'number' ? a[sort] - b[sort] : String(a[sort]).localeCompare(String(b[sort]), 'pt'));

  $('#productsTable').innerHTML = products.map((product) => {
    const [label, type] = stockStatus(product);
    return `<tr><td><strong>${product.nome}</strong><br><small>${product.descricao || 'Sem descrição'}</small></td><td>${product.codigo_produto}<br><small>${product.codigo_barras || 'Sem código de barras'}</small></td><td>${getCategoryName(product.categoria_id)}</td><td>${product.quantidade_estoque} ${product.unidade_medida}</td><td>${money(product.preco_venda)}</td><td><span class="status status--${type}">${label}</span></td><td><div class="row-actions"><button class="icon-button" data-edit="${product.id}">Editar</button><button class="icon-button icon-button--danger" data-delete="${product.id}">Excluir</button></div></td></tr>`;
  }).join('') || '<tr><td colspan="7">Nenhum produto encontrado para esta empresa.</td></tr>';

  document.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => editProduct(Number(button.dataset.edit))));
  document.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => openDeleteModal(Number(button.dataset.delete))));
  renderMetrics();
}

function collectProductForm() {
  return {
    nome: $('#productName').value.trim(), codigo_produto: $('#productCode').value.trim(), codigo_barras: $('#barcode').value.trim(), categoria_id: Number($('#categoryId').value), fornecedor_nome: $('#supplier').value.trim(), descricao: $('#description').value.trim(), unidade_medida: $('#unit').value, preco_compra: Number($('#purchasePrice').value), preco_venda: Number($('#salePrice').value), quantidade_estoque: Number($('#stockQuantity').value), estoque_minimo: Number($('#minimumStock').value),
  };
}

function validateProduct(payload, editingId = null) {
  if (!payload.nome || !payload.codigo_produto || !payload.categoria_id || !payload.unidade_medida) return 'Preencha nome, código interno, categoria e unidade de medida.';
  if ([payload.preco_compra, payload.preco_venda, payload.quantidade_estoque, payload.estoque_minimo].some((value) => Number.isNaN(value) || value < 0)) return 'Preços e quantidades não podem ser negativos.';
  if (!companyScoped(state.categories).some((category) => category.id === payload.categoria_id)) return 'Categoria inválida para a empresa ativa.';
  const duplicatedCode = companyScoped(state.products).some((product) => product.codigo_produto === payload.codigo_produto && product.id !== editingId);
  return duplicatedCode ? 'Código interno já utilizado nesta empresa.' : '';
}

function saveProduct(event) {
  event.preventDefault();
  const editingId = Number($('#productId').value || 0);
  const payload = collectProductForm();
  const error = validateProduct(payload, editingId || null);
  if (error) return showMessage(error, 'error');

  if (editingId) {
    const product = state.products.find((item) => item.id === editingId && item.empresa_id === activeCompanyId);
    if (!product) return showMessage('Produto não encontrado no escopo da empresa.', 'error');
    registerProductChanges(product, payload);
    Object.assign(product, payload, { data_atualizacao: today() });
    showMessage('Produto atualizado com segurança.', 'success');
  } else {
    state.products.push({ id: nextId(state.products), empresa_id: activeCompanyId, fornecedor_id: null, ...payload, data_criacao: today(), data_atualizacao: today() });
    addLog(`Produto "${payload.nome}" cadastrado.`);
    showMessage('Produto cadastrado com sucesso.', 'success');
  }
  resetProductForm(false);
  renderAll();
}

function registerProductChanges(oldProduct, nextProduct) {
  [['preco_compra', 'preço de compra'], ['preco_venda', 'preço de venda'], ['categoria_id', 'categoria'], ['estoque_minimo', 'estoque mínimo']].forEach(([field, label]) => {
    if (oldProduct[field] !== nextProduct[field]) addLog(`Alterado ${label} do produto "${oldProduct.nome}".`);
  });
}

function editProduct(id) {
  const product = state.products.find((item) => item.id === id && item.empresa_id === activeCompanyId);
  if (!product) return showMessage('Acesso negado: produto pertence a outra empresa.', 'error');
  $('#productId').value = product.id; $('#productName').value = product.nome; $('#productCode').value = product.codigo_produto; $('#barcode').value = product.codigo_barras || ''; $('#categoryId').value = product.categoria_id; $('#unit').value = product.unidade_medida; $('#supplier').value = product.fornecedor_nome || ''; $('#purchasePrice').value = product.preco_compra; $('#salePrice').value = product.preco_venda; $('#stockQuantity').value = product.quantidade_estoque; $('#minimumStock').value = product.estoque_minimo; $('#description').value = product.descricao || '';
  $('#submitProduct').textContent = 'Atualizar produto';
  location.hash = 'product-form-section';
}

function resetProductForm(clearMessage = true) {
  $('#productForm').reset(); $('#productId').value = ''; $('#submitProduct').textContent = 'Salvar produto';
  if (clearMessage) $('#formMessage').textContent = '';
}

function openDeleteModal(id) {
  const product = state.products.find((item) => item.id === id && item.empresa_id === activeCompanyId);
  if (!product) return showMessage('Acesso negado: produto fora da empresa ativa.', 'error');
  deleteTargetId = id; $('#confirmText').textContent = `Tem certeza que deseja excluir "${product.nome}"? Esta ação está preparada para futura exclusão lógica.`; $('#confirmModal').hidden = false;
}
function closeDeleteModal() { deleteTargetId = null; $('#confirmModal').hidden = true; }
function confirmDeleteProduct() {
  const product = state.products.find((item) => item.id === deleteTargetId && item.empresa_id === activeCompanyId);
  if (product) { state.products = state.products.filter((item) => item.id !== product.id); addLog(`Produto "${product.nome}" excluído com confirmação.`); }
  closeDeleteModal(); renderAll();
}

function saveCategory(event) {
  event.preventDefault();
  const id = Number($('#categoryEditId').value || 0); const nome = $('#categoryName').value.trim(); const descricao = $('#categoryDescription').value.trim();
  if (!nome) return;
  const duplicate = companyScoped(state.categories).some((category) => category.nome.toLowerCase() === nome.toLowerCase() && category.id !== id);
  if (duplicate) return alert('Categoria já existe nesta empresa.');
  if (id) { const category = state.categories.find((item) => item.id === id && item.empresa_id === activeCompanyId); Object.assign(category, { nome, descricao }); addLog(`Categoria "${nome}" atualizada.`); }
  else { state.categories.push({ id: nextId(state.categories), empresa_id: activeCompanyId, nome, descricao, data_criacao: today() }); addLog(`Categoria "${nome}" criada.`); }
  resetCategoryForm(); renderAll();
}

function renderCategories() {
  $('#categoriesList').innerHTML = companyScoped(state.categories).map((category) => `<article class="category-card"><h3>${category.nome}</h3><p>${category.descricao || 'Sem descrição'}</p><small>Criada em ${category.data_criacao}</small><div class="row-actions"><button class="icon-button" data-edit-category="${category.id}">Editar</button><button class="icon-button icon-button--danger" data-remove-category="${category.id}">Remover</button></div></article>`).join('');
  document.querySelectorAll('[data-edit-category]').forEach((button) => button.addEventListener('click', () => editCategory(Number(button.dataset.editCategory))));
  document.querySelectorAll('[data-remove-category]').forEach((button) => button.addEventListener('click', () => removeCategory(Number(button.dataset.removeCategory))));
}
function editCategory(id) { const category = state.categories.find((item) => item.id === id && item.empresa_id === activeCompanyId); $('#categoryEditId').value = category.id; $('#categoryName').value = category.nome; $('#categoryDescription').value = category.descricao || ''; }
function removeCategory(id) {
  if (companyScoped(state.products).some((product) => product.categoria_id === id)) return alert('Categoria possui produtos associados. Altere os produtos antes de remover.');
  const category = state.categories.find((item) => item.id === id && item.empresa_id === activeCompanyId); if (!category) return;
  if (confirm(`Remover a categoria "${category.nome}"?`)) { state.categories = state.categories.filter((item) => item.id !== id); addLog(`Categoria "${category.nome}" removida.`); renderAll(); }
}
function resetCategoryForm() { $('#categoryForm').reset(); $('#categoryEditId').value = ''; }

function renderMetrics() { const products = companyScoped(state.products); $('#totalProducts').textContent = products.length; $('#lowStockProducts').textContent = products.filter((product) => product.quantidade_estoque <= product.estoque_minimo).length; $('#totalCategories').textContent = companyScoped(state.categories).length; $('#stockValue').textContent = money(products.reduce((sum, product) => sum + product.preco_venda * product.quantidade_estoque, 0)); }
function addLog(message) { state.changeLog.unshift({ empresa_id: activeCompanyId, message, date: new Date().toLocaleString('pt-AO') }); renderChangeLog(); }
function renderChangeLog() { $('#changeLog').innerHTML = companyScoped(state.changeLog).slice(0, 8).map((log) => `<li><strong>${log.date}</strong> — ${log.message}</li>`).join('') || '<li>Nenhuma alteração registrada para esta empresa.</li>'; }
function showMessage(text, type) { $('#formMessage').className = `message message--${type}`; $('#formMessage').textContent = text; }

document.addEventListener('DOMContentLoaded', init);
