const analysisForm = document.querySelector("#analysisForm");
const newsInput = document.querySelector("#newsInput");
const resultCard = document.querySelector("#resultCard");
const clearButton = document.querySelector("#clearButton");

const sensationalTerms = [
  "urgente",
  "partilhe",
  "choque",
  "bomba",
  "escândalo",
  "não querem que saibas",
  "última hora",
  "viral",
  "cura milagrosa",
  "segredo"
];

const suspiciousRumorPatterns = [
  {
    label: "vagas urgentes sem experiência",
    pattern: /\bvagas?\s+urgentes?\s+(?:e\s+)?sem\s+experi[êe]ncia\b/,
    explanation: "ofertas de emprego vagas, urgentes e sem critérios claros são frequentemente usadas para recolher dados ou levar a links falsos."
  },
  {
    label: "ganhe dinheiro fácil",
    pattern: /\bganh[ae]r?\s+dinheiro\s+f[aá]cil\b|\bdinheiro\s+f[aá]cil\b/,
    explanation: "promessas de dinheiro fácil costumam esconder esquemas, burlas ou pedidos de pagamento antecipado."
  },
  {
    label: "partilhe com 5 grupos",
    pattern: /\bpartilh[ae]\s+(?:com|em|para)\s+\d+\s+grupos?\b|\bpartilh[ae]\s+(?:com|em|para)\s+cinco\s+grupos?\b/,
    explanation: "pedidos para partilhar em vários grupos tentam forçar viralização antes de qualquer verificação."
  },
  {
    label: "bónus do governo",
    pattern: /\bb[oó]nus\s+d[oe]\s+governo\b|\bsubs[ií]dio\s+do\s+governo\s+dispon[ií]vel\b/,
    explanation: "mensagens sobre benefícios públicos devem ser confirmadas em canais oficiais, porque boatos imitam programas do Estado."
  },
  {
    label: "link oficial atualizado",
    pattern: /\blink\s+oficial\s+atualizado\b|\blink\s+actualizado\s+oficial\b|\blink\s+oficial\s+actualizado\b/,
    explanation: "a expressão tenta passar confiança sem identificar a instituição responsável ou um domínio verificável."
  },
  {
    label: "cadastro imediato por WhatsApp",
    pattern: /\b(?:cadastro|inscri[cç][aã]o|registo)\s+(?:imediat[oa]|urgente)\b.*\bwhats ?app\b|\bwhats ?app\b.*\b(?:cadastro|inscri[cç][aã]o|registo)\s+(?:imediat[oa]|urgente)\b/,
    explanation: "cadastros urgentes por WhatsApp podem ser usados para recolher dados pessoais sem garantia de origem."
  },
  {
    label: "promoção termina hoje",
    pattern: /\b(?:promo[cç][aã]o|oferta|campanha)\s+(?:termina|acaba)\s+hoje\b|\b[uú]ltimas?\s+vagas?\b/,
    explanation: "pressão de tempo reduz a capacidade de confirmar a informação e é comum em correntes falsas."
  },
  {
    label: "não perca esta oportunidade",
    pattern: /\bn[aã]o\s+perca\s+(?:esta|essa)\s+oportunidade\b|\boportunidade\s+[uú]nica\b/,
    explanation: "frases promocionais sem fonte clara são típicas de mensagens de boato e captação de cliques."
  },
  {
    label: "envie os seus dados",
    pattern: /\benvie\s+(?:os\s+)?(?:seus\s+)?dados\b|\binforme\s+(?:o\s+)?(?:seu\s+)?n[uú]mero\s+do\s+bi\b/,
    explanation: "pedidos de dados pessoais em mensagens virais podem indicar tentativa de burla ou phishing."
  }
];

const sourceTerms = [
  "ministério",
  "governo",
  "polícia",
  "jornal",
  "rádio",
  "televisão",
  "universidade",
  "organização",
  "relatório",
  "comunicado",
  "fonte"
];

const verifiableTerms = [
  "angola",
  "luanda",
  "benguela",
  "huambo",
  "cabinda",
  "namibe",
  "assembleia",
  "tribunal",
  "hospital",
  "escola",
  "empresa"
];

function countMatches(text, terms) {
  return terms.filter((term) => text.includes(term)).length;
}

function findSuspiciousRumors(text) {
  return suspiciousRumorPatterns.filter((item) => item.pattern.test(text));
}

function buildSuspiciousExplanation(matches) {
  const terms = matches.map((item) => `“${item.label}”`).join(", ");
  return `Encontrámos padrões de boato muito usados em correntes digitais em Angola: ${terms}. Estes sinais não provam tudo sozinhos, mas indicam alto risco porque exploram urgência, promessas fáceis, pedidos de partilha ou links sem fonte verificável.`;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, score));
}

function buildCriterion(label, status, detail) {
  const symbol = status === "positive" ? "✅" : status === "negative" ? "⚠️" : "ℹ️";
  return `<li><strong>${symbol} ${label}:</strong> ${detail}</li>`;
}

function classifyScore(score, suspiciousMatches = []) {
  if (suspiciousMatches.length > 0) {
    return {
      badgeClass: "badge--rumor",
      label: "[Falso / Rumor]",
      message: buildSuspiciousExplanation(suspiciousMatches),
      isSuspiciousRumor: true
    };
  }

  if (score >= 72) {
    return {
      badgeClass: "badge--success",
      label: "Credibilidade moderada/alta",
      message: "O texto apresenta vários sinais verificáveis, mas ainda deve ser confirmado em fontes independentes."
    };
  }

  if (score >= 45) {
    return {
      badgeClass: "badge--warning",
      label: "Credibilidade incerta",
      message: "Há sinais úteis, mas também lacunas. Procure confirmar origem, data e contexto antes de partilhar."
    };
  }

  return {
    badgeClass: "badge--danger",
    label: "Alto risco de desinformação",
    message: "O conteúdo tem poucos elementos verificáveis ou usa linguagem suspeita. Evite partilhar sem confirmação."
  };
}

function analyzeNews(rawText) {
  const text = rawText.trim().toLowerCase();
  const suspiciousMatches = findSuspiciousRumors(text);
  let score = 38;
  const criteria = [];

  if (suspiciousMatches.length > 0) {
    score = 12;
    criteria.push(
      buildCriterion(
        "Alerta de rumor",
        "negative",
        suspiciousMatches.map((item) => item.explanation).join(" ")
      )
    );
  }

  if (text.length >= 280) {
    score += 16;
    criteria.push(buildCriterion("Contexto", "positive", "o texto contém detalhes suficientes para uma primeira leitura."));
  } else if (text.length >= 120) {
    score += 8;
    criteria.push(buildCriterion("Contexto", "neutral", "há algum contexto, mas detalhes adicionais ajudariam a validação."));
  } else {
    score -= 12;
    criteria.push(buildCriterion("Contexto", "negative", "o texto é curto e pode omitir informações importantes."));
  }

  const sourceMatches = countMatches(text, sourceTerms);
  if (sourceMatches >= 2 || text.includes("http://") || text.includes("https://")) {
    score += 18;
    criteria.push(buildCriterion("Fontes", "positive", "foram encontrados indícios de fontes, instituições ou links."));
  } else if (sourceMatches === 1) {
    score += 8;
    criteria.push(buildCriterion("Fontes", "neutral", "existe uma possível referência, mas a origem precisa de confirmação."));
  } else {
    score -= 14;
    criteria.push(buildCriterion("Fontes", "negative", "não foram identificadas fontes claras ou referências verificáveis."));
  }

  const sensationalMatches = countMatches(text, sensationalTerms);
  if (sensationalMatches >= 2) {
    score -= 24;
    criteria.push(buildCriterion("Linguagem", "negative", "há vários termos associados a alarmismo ou apelos virais."));
  } else if (sensationalMatches === 1) {
    score -= 10;
    criteria.push(buildCriterion("Linguagem", "neutral", "foi encontrado um termo que pode indicar sensacionalismo."));
  } else {
    score += 10;
    criteria.push(buildCriterion("Linguagem", "positive", "não foram encontrados sinais fortes de alarmismo."));
  }

  const hasDate = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|20\d{2}|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/.test(text);
  if (hasDate) {
    score += 10;
    criteria.push(buildCriterion("Data", "positive", "o texto inclui uma referência temporal que pode ser verificada."));
  } else {
    score -= 6;
    criteria.push(buildCriterion("Data", "neutral", "não há data evidente; verifique quando o facto teria acontecido."));
  }

  const verifiableMatches = countMatches(text, verifiableTerms);
  if (verifiableMatches >= 2) {
    score += 12;
    criteria.push(buildCriterion("Termos verificáveis", "positive", "foram encontrados locais ou entidades que podem apoiar a verificação."));
  } else if (verifiableMatches === 1) {
    score += 4;
    criteria.push(buildCriterion("Termos verificáveis", "neutral", "há pelo menos uma pista concreta para investigação."));
  } else {
    score -= 8;
    criteria.push(buildCriterion("Termos verificáveis", "negative", "faltam locais, instituições ou entidades concretas."));
  }

  const finalScore = suspiciousMatches.length > 0 ? clampScore(Math.min(score, 24)) : clampScore(score);
  return {
    score: finalScore,
    criteria,
    classification: classifyScore(finalScore, suspiciousMatches),
    suspiciousMatches
  };
}

function renderResult(analysis) {
  const suspiciousList = analysis.suspiciousMatches.length > 0
    ? `<div class="rumor-alert" role="alert" aria-live="polite">
        <strong>🚨 Alerta visual: provável mensagem falsa ou rumor</strong>
        <span>Expressões detetadas: ${analysis.suspiciousMatches.map((item) => item.label).join(", ")}</span>
      </div>`
    : "";

  resultCard.innerHTML = `
    <div class="result-summary ${analysis.classification.isSuspiciousRumor ? "result-summary--rumor" : ""}">
      <span class="badge ${analysis.classification.badgeClass}">${analysis.classification.label}</span>
      ${suspiciousList}
      <div class="score" aria-label="Pontuação de credibilidade ${analysis.score} de 100">
        <span class="score__value">${analysis.score}</span>
        <span>/100</span>
      </div>
      <p>${analysis.classification.message}</p>
      <ul class="check-list">
        ${analysis.criteria.join("")}
      </ul>
    </div>
  `;
}

function renderEmptyResult() {
  resultCard.innerHTML = `
    <div class="result-card__empty">
      <span class="result-card__icon" aria-hidden="true">🛡️</span>
      <h3>Resultado aparecerá aqui</h3>
      <p>Insira uma notícia para receber uma pontuação e recomendações de validação.</p>
    </div>
  `;
}

analysisForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = newsInput.value.trim();
  if (text.length < 30) {
    resultCard.innerHTML = `
      <div class="result-summary">
        <span class="badge badge--danger">Texto insuficiente</span>
        <h3>Adicione mais informação</h3>
        <p>Para uma simulação útil, insira pelo menos 30 caracteres com contexto da notícia.</p>
      </div>
    `;
    newsInput.focus();
    return;
  }

  renderResult(analyzeNews(text));
});

clearButton.addEventListener("click", () => {
  newsInput.value = "";
  renderEmptyResult();
  newsInput.focus();
});
