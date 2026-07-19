const companies = [
  { id: 1, name: 'Mercado Kilamba' },
  { id: 2, name: 'Farmácia Atlântico' },
];

let activeCompanyId = 1;
let deleteTarget = null;

const state = {
  supplierCategories: [
    { id: 1, empresa_id: 1, nome: 'Distribuidor alimentar', descricao: 'Alimentos, bebidas e bens de consumo', data_criacao: '2026-07-01' },
    { id: 2, empresa_id: 1, nome: 'Importador', descricao: 'Produtos importados e cargas internacionais', data_criacao: '2026-07-02' },
    { id: 3, empresa_id: 1, nome: 'Fornecedor local', descricao: 'Fornecimento regional recorrente', data_criacao: '2026-07-03' },
    { id: 4, empresa_id: 2, nome: 'Fabricante farmacêutico', descricao: 'Medicamentos e materiais de saúde', data_criacao: '2026-07-03' },
  ],
  suppliers: [
    { id: 1, empresa_id: 1, categoria_id: 1, nome_empresa: 'AgroDistribuição Lda', nome_responsavel: 'Maria José', nif: '5410000012', telefone: '+244 923 000 111', email: 'comercial@agrodist.co.ao', endereco: 'Rua do Comércio, armazém 12', cidade: 'Luanda', pais: 'Angola', observacoes: 'Entrega às terças e quintas.', status: 'ativo', data_criacao: '2026-07-10', data_atualizacao: '2026-07-10', data_exclusao: null },
    { id: 2, empresa_id: 1, categoria_id: 2, nome_empresa: 'Bebidas Sul', nome_responsavel: 'Carlos Manuel', nif: '5410000020', telefone: '+244 924 000 222', email: 'vendas@bebidassul.ao', endereco: 'Zona Industrial de Viana', cidade: 'Luanda', pais: 'Angola', observacoes: 'Importador de águas e sumos.', status: 'ativo', data_criacao: '2026-07-11', data_atualizacao: '2026-07-12', data_exclusao: null },
    { id: 3, empresa_id: 2, categoria_id: 4, nome_empresa: 'Saúde Global', nome_responsavel: 'Helena Costa', nif: '7420000099', telefone: '+244 925 000 333', email: 'supply@saudeglobal.ao', endereco: 'Avenida da Saúde, 77', cidade: 'Benguela', pais: 'Angola', observacoes: 'Documentação sanitária validada.', status: 'ativo', data_criacao: '2026-07-12', data_atualizacao: '2026-07-12', data_exclusao: null },
  ],
  products: [
    { id: 1, empresa_id: 1, fornecedor_id: 1, nome: 'Arroz agulha 5kg', codigo_produto: 'ALI-001', quantidade_estoque: 42, estoque_minimo: 12 },
    { id: 2, empresa_id: 1, fornecedor_id: 2, nome: 'Água mineral 1.5L', codigo_produto: 'BEB-014', quantidade_estoque: 8, estoque_minimo: 20 },
    { id: 3, empresa_id: 2, fornecedor_id: 3, nome: 'Paracetamol 500mg', codigo_produto: 'MED-001', quantidade_estoque: 120, estoque_minimo: 25 },
  ],
  changeLog: [],
};

const $ = (selector) => document.querySelector(selector);
const companyScoped = (items) => items.filter((item) => item.empresa_id === activeCompanyId && !item.data_exclusao);
const today = () => new Date().toISOString().slice(0, 10);
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
    resetSupplierForm();
    resetSupplierCategoryForm();
    renderAll();
  });
  $('#supplierForm').addEventListener('submit', saveSupplier);
  $('#cancelSupplierEdit').addEventListener('click', resetSupplierForm);
  $('#supplierCategoryForm').addEventListener('submit', saveSupplierCategory);
  $('#cancelSupplierCategoryEdit').addEventListener('click', resetSupplierCategoryForm);
  ['#supplierSearchName', '#supplierSearchPhone', '#supplierCategoryFilter', '#sortSuppliers'].forEach((selector) => $(selector).addEventListener('input', renderSuppliers));
  $('#confirmDelete').addEventListener('click', confirmDeleteSupplier);
  $('#cancelDelete').addEventListener('click', closeDeleteModal);
}

function renderAll() {
  renderSupplierCategoryOptions();
  renderSuppliers();
  renderSupplierCategories();
  renderProducts();
  renderMetrics();
  renderChangeLog();
}

function renderSupplierCategoryOptions() {
  const options = companyScoped(state.supplierCategories).map((category) => `<option value="${category.id}">${category.nome}</option>`).join('');
  $('#supplierCategoryId').innerHTML = `<option value="">Selecione</option>${options}`;
  $('#supplierCategoryFilter').innerHTML = `<option value="">Todas as categorias</option>${options}`;
}

function getSupplierCategoryName(categoryId) {
  return companyScoped(state.supplierCategories).find((category) => category.id === Number(categoryId))?.nome || 'Sem categoria';
}

function getSupplierName(supplierId) {
  return companyScoped(state.suppliers).find((supplier) => supplier.id === Number(supplierId))?.nome_empresa || 'Sem fornecedor vinculado';
}

function statusLabel(status) {
  const map = { ativo: ['Ativo', 'ok'], inativo: ['Inativo', 'low'], bloqueado: ['Bloqueado', 'out'] };
  return map[status] || ['Indefinido', 'low'];
}

function productStatus(product) {
  if (product.quantidade_estoque <= 0) return ['Esgotado', 'out'];
  if (product.quantidade_estoque <= product.estoque_minimo) return ['Baixo estoque', 'low'];
  return ['Disponível', 'ok'];
}

function renderSuppliers() {
  const name = $('#supplierSearchName').value.trim().toLowerCase();
  const phone = $('#supplierSearchPhone').value.trim().toLowerCase();
  const category = Number($('#supplierCategoryFilter').value || 0);
  const sort = $('#sortSuppliers').value;
  const suppliers = companyScoped(state.suppliers)
    .filter((supplier) => supplier.nome_empresa.toLowerCase().includes(name))
    .filter((supplier) => supplier.telefone.toLowerCase().includes(phone))
    .filter((supplier) => !category || supplier.categoria_id === category)
    .sort((a, b) => String(a[sort] || '').localeCompare(String(b[sort] || ''), 'pt'));

  $('#suppliersTable').innerHTML = suppliers.map((supplier) => {
    const [label, type] = statusLabel(supplier.status);
    return `<tr><td><strong>${supplier.nome_empresa}</strong><br><small>NIF ${supplier.nif}</small></td><td>${supplier.nome_responsavel}</td><td>${supplier.telefone}</td><td>${supplier.email || 'Sem email'}</td><td>${getSupplierCategoryName(supplier.categoria_id)}</td><td><span class="status status--${type}">${label}</span></td><td><div class="row-actions"><button class="icon-button" data-detail-supplier="${supplier.id}">Detalhes</button><button class="icon-button" data-edit-supplier="${supplier.id}">Editar</button><button class="icon-button icon-button--danger" data-delete-supplier="${supplier.id}">Excluir</button></div></td></tr>`;
  }).join('') || '<tr><td colspan="7">Nenhum fornecedor encontrado para esta empresa.</td></tr>';

  document.querySelectorAll('[data-detail-supplier]').forEach((button) => button.addEventListener('click', () => renderSupplierProfile(Number(button.dataset.detailSupplier))));
  document.querySelectorAll('[data-edit-supplier]').forEach((button) => button.addEventListener('click', () => editSupplier(Number(button.dataset.editSupplier))));
  document.querySelectorAll('[data-delete-supplier]').forEach((button) => button.addEventListener('click', () => openDeleteModal(Number(button.dataset.deleteSupplier))));
}

function collectSupplierForm() {
  return { nome_empresa: $('#supplierCompanyName').value.trim(), nome_responsavel: $('#supplierContactName').value.trim(), nif: $('#supplierNif').value.trim(), telefone: $('#supplierPhone').value.trim(), email: $('#supplierEmail').value.trim(), categoria_id: Number($('#supplierCategoryId').value), endereco: $('#supplierAddress').value.trim(), cidade: $('#supplierCity').value.trim(), pais: $('#supplierCountry').value.trim(), status: $('#supplierStatus').value, observacoes: $('#supplierNotes').value.trim() };
}

function validateSupplier(payload, editingId = null) {
  if (!payload.nome_empresa || !payload.nome_responsavel || !payload.nif || !payload.telefone || !payload.categoria_id) return 'Preencha nome da empresa, responsável, NIF, telefone e categoria.';
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return 'Informe um email válido.';
  if (!companyScoped(state.supplierCategories).some((category) => category.id === payload.categoria_id)) return 'Categoria inválida para a empresa ativa.';
  const duplicateNif = companyScoped(state.suppliers).some((supplier) => supplier.nif === payload.nif && supplier.id !== editingId);
  return duplicateNif ? 'NIF já utilizado por outro fornecedor desta empresa.' : '';
}

function saveSupplier(event) {
  event.preventDefault();
  const editingId = Number($('#supplierId').value || 0);
  const payload = collectSupplierForm();
  const error = validateSupplier(payload, editingId || null);
  if (error) return showSupplierMessage(error, 'error');
  if (editingId) {
    const supplier = state.suppliers.find((item) => item.id === editingId && item.empresa_id === activeCompanyId && !item.data_exclusao);
    if (!supplier) return showSupplierMessage('Fornecedor não encontrado no escopo da empresa.', 'error');
    Object.assign(supplier, payload, { data_atualizacao: today() });
    addLog(`Fornecedor "${payload.nome_empresa}" atualizado.`);
    showSupplierMessage('Fornecedor atualizado com segurança.', 'success');
  } else {
    state.suppliers.push({ id: nextId(state.suppliers), empresa_id: activeCompanyId, ...payload, data_criacao: today(), data_atualizacao: today(), data_exclusao: null });
    addLog(`Fornecedor "${payload.nome_empresa}" cadastrado.`);
    showSupplierMessage('Fornecedor cadastrado com sucesso.', 'success');
  }
  resetSupplierForm(false);
  renderAll();
}

function editSupplier(id) {
  const supplier = state.suppliers.find((item) => item.id === id && item.empresa_id === activeCompanyId && !item.data_exclusao);
  if (!supplier) return showSupplierMessage('Acesso negado: fornecedor pertence a outra empresa.', 'error');
  $('#supplierId').value = supplier.id; $('#supplierCompanyName').value = supplier.nome_empresa; $('#supplierContactName').value = supplier.nome_responsavel; $('#supplierNif').value = supplier.nif; $('#supplierPhone').value = supplier.telefone; $('#supplierEmail').value = supplier.email || ''; $('#supplierCategoryId').value = supplier.categoria_id; $('#supplierAddress').value = supplier.endereco || ''; $('#supplierCity').value = supplier.cidade || ''; $('#supplierCountry').value = supplier.pais || ''; $('#supplierStatus').value = supplier.status; $('#supplierNotes').value = supplier.observacoes || '';
  $('#submitSupplier').textContent = 'Atualizar fornecedor';
  location.hash = 'supplier-form-section';
}

function renderSupplierProfile(id) {
  const supplier = state.suppliers.find((item) => item.id === id && item.empresa_id === activeCompanyId && !item.data_exclusao);
  if (!supplier) return showSupplierMessage('Acesso negado ao perfil do fornecedor.', 'error');
  $('#supplierProfile').innerHTML = `<article class="profile-card"><h3>${supplier.nome_empresa}</h3><p><strong>Responsável:</strong> ${supplier.nome_responsavel}</p><p><strong>NIF:</strong> ${supplier.nif}</p><p><strong>Categoria:</strong> ${getSupplierCategoryName(supplier.categoria_id)}</p><p><strong>Status:</strong> ${statusLabel(supplier.status)[0]}</p></article><article class="profile-card"><h3>Contactos e endereço</h3><p><strong>Telefone:</strong> ${supplier.telefone}</p><p><strong>Email:</strong> ${supplier.email || 'Sem email'}</p><p><strong>Endereço:</strong> ${supplier.endereco || 'Não informado'}, ${supplier.cidade || 'cidade não informada'}, ${supplier.pais || 'país não informado'}</p><p><strong>Observações:</strong> ${supplier.observacoes || 'Sem observações'}</p></article><article class="profile-card profile-card--future"><h3>Preparação futura</h3><p>Produtos fornecidos, histórico de compras, valores movimentados e última compra serão integrados ao módulo de compras sem quebrar o isolamento por empresa.</p></article>`;
  location.hash = 'supplier-profile';
}

function resetSupplierForm(clearMessage = true) { $('#supplierForm').reset(); $('#supplierId').value = ''; $('#submitSupplier').textContent = 'Salvar fornecedor'; if (clearMessage) $('#supplierFormMessage').textContent = ''; }
function showSupplierMessage(text, type) { $('#supplierFormMessage').className = `message message--${type}`; $('#supplierFormMessage').textContent = text; }

function openDeleteModal(id) {
  const supplier = state.suppliers.find((item) => item.id === id && item.empresa_id === activeCompanyId && !item.data_exclusao);
  if (!supplier) return showSupplierMessage('Acesso negado: fornecedor fora da empresa ativa.', 'error');
  deleteTarget = id; $('#confirmText').textContent = `Tem certeza que deseja excluir "${supplier.nome_empresa}"? A operação usa exclusão lógica e não remove produtos vinculados.`; $('#confirmModal').hidden = false;
}
function closeDeleteModal() { deleteTarget = null; $('#confirmModal').hidden = true; }
function confirmDeleteSupplier() {
  const supplier = state.suppliers.find((item) => item.id === deleteTarget && item.empresa_id === activeCompanyId && !item.data_exclusao);
  if (supplier) { Object.assign(supplier, { status: 'inativo', data_exclusao: today(), data_atualizacao: today() }); addLog(`Fornecedor "${supplier.nome_empresa}" marcado como excluído.`); }
  closeDeleteModal(); renderAll();
}

function saveSupplierCategory(event) {
  event.preventDefault();
  const id = Number($('#supplierCategoryEditId').value || 0); const nome = $('#supplierCategoryName').value.trim(); const descricao = $('#supplierCategoryDescription').value.trim();
  if (!nome) return;
  const duplicate = companyScoped(state.supplierCategories).some((category) => category.nome.toLowerCase() === nome.toLowerCase() && category.id !== id);
  if (duplicate) return alert('Categoria de fornecedor já existe nesta empresa.');
  if (id) { const category = state.supplierCategories.find((item) => item.id === id && item.empresa_id === activeCompanyId); Object.assign(category, { nome, descricao }); addLog(`Categoria de fornecedor "${nome}" atualizada.`); }
  else { state.supplierCategories.push({ id: nextId(state.supplierCategories), empresa_id: activeCompanyId, nome, descricao, data_criacao: today() }); addLog(`Categoria de fornecedor "${nome}" criada.`); }
  resetSupplierCategoryForm(); renderAll();
}

function renderSupplierCategories() {
  $('#supplierCategoriesList').innerHTML = companyScoped(state.supplierCategories).map((category) => `<article class="category-card"><h3>${category.nome}</h3><p>${category.descricao || 'Sem descrição'}</p><small>Criada em ${category.data_criacao}</small><div class="row-actions"><button class="icon-button" data-edit-supplier-category="${category.id}">Editar</button><button class="icon-button icon-button--danger" data-remove-supplier-category="${category.id}">Remover</button></div></article>`).join('');
  document.querySelectorAll('[data-edit-supplier-category]').forEach((button) => button.addEventListener('click', () => editSupplierCategory(Number(button.dataset.editSupplierCategory))));
  document.querySelectorAll('[data-remove-supplier-category]').forEach((button) => button.addEventListener('click', () => removeSupplierCategory(Number(button.dataset.removeSupplierCategory))));
}
function editSupplierCategory(id) { const category = state.supplierCategories.find((item) => item.id === id && item.empresa_id === activeCompanyId); $('#supplierCategoryEditId').value = category.id; $('#supplierCategoryName').value = category.nome; $('#supplierCategoryDescription').value = category.descricao || ''; }
function removeSupplierCategory(id) {
  if (companyScoped(state.suppliers).some((supplier) => supplier.categoria_id === id)) return alert('Categoria possui fornecedores associados. Altere os fornecedores antes de remover.');
  const category = state.supplierCategories.find((item) => item.id === id && item.empresa_id === activeCompanyId); if (!category) return;
  if (confirm(`Remover a categoria "${category.nome}"?`)) { state.supplierCategories = state.supplierCategories.filter((item) => item.id !== id); addLog(`Categoria de fornecedor "${category.nome}" removida.`); renderAll(); }
}
function resetSupplierCategoryForm() { $('#supplierCategoryForm').reset(); $('#supplierCategoryEditId').value = ''; }

function renderProducts() {
  $('#productsTable').innerHTML = companyScoped(state.products).map((product) => { const [label, type] = productStatus(product); return `<tr><td><strong>${product.nome}</strong></td><td>${product.codigo_produto}</td><td>${getSupplierName(product.fornecedor_id)}</td><td><span class="status status--${type}">${label}</span></td></tr>`; }).join('') || '<tr><td colspan="4">Nenhum produto vinculado para esta empresa.</td></tr>';
}
function renderMetrics() { const suppliers = companyScoped(state.suppliers); $('#totalSuppliers').textContent = suppliers.length; $('#activeSuppliers').textContent = suppliers.filter((supplier) => supplier.status === 'ativo').length; $('#totalSupplierCategories').textContent = companyScoped(state.supplierCategories).length; $('#linkedProducts').textContent = companyScoped(state.products).filter((product) => product.fornecedor_id).length; }
function addLog(message) { state.changeLog.unshift({ empresa_id: activeCompanyId, message, date: new Date().toLocaleString('pt-AO') }); renderChangeLog(); }
function renderChangeLog() { $('#changeLog').innerHTML = companyScoped(state.changeLog).slice(0, 8).map((log) => `<li><strong>${log.date}</strong> — ${log.message}</li>`).join('') || '<li>Nenhuma alteração registrada para esta empresa.</li>'; }

document.addEventListener('DOMContentLoaded', init);
