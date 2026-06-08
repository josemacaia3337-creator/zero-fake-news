// =================================================================
// ZERO FAKE NEWS - MOTOR DE ANÁLISE DINÂMICO (MVP INSTITUCIONAL)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const analysisForm = document.querySelector('#analysisForm') || document.querySelector('form');
    const newsInput = document.querySelector('#newsInput') || document.querySelector('textarea');
    const resultCard = document.querySelector('#resultCard') || document.querySelector('.result-section');
    const loadingSpinner = document.querySelector('#loadingSpinner') || document.querySelector('.loading');

    // Base de dados simulada de boatos conhecidos em Angola
    const localHoaxDatabase = [
        {
            keywords: ["bónus", "kwanzas", "governo", "subsídio"],
            score: 12,
            level: "Muito Baixa Confiabilidade",
            color: "#dc3545",
            explanation: "Este texto corresponde a um golpe cibernético clássico de phishing que circula no WhatsApp, prometendo falsos subsídios estatais para roubar dados dos cidadãos. O Governo de Angola já desmentiu oficialmente esta campanha.",
            negatives: ["Ausência de fontes oficiais", "Promessas de ganho fácil", "Uso de links não governamentais (.xyz)"],
            positives: []
        },
        {
            keywords: ["sorteio", "motorizada", "marca", "ganhe"],
            score: 18,
            level: "Baixa Confiabilidade",
            color: "#dc3545",
            explanation: "Esquema fraudulento de engenharia social focado em disseminar links falsos para capturar informações pessoais em troca de prémios inexistentes.",
            negatives: ["Linguagem emocional extrema", "Uso de termos de urgência ('Partilhe já')", "Domínio web suspeito"],
            positives: []
        },
        {
            keywords: ["angop", "comunicado", "oficial", "ministério"],
            score: 95,
            level: "Alta Confiabilidade",
            color: "#28a745",
            explanation: "A estrutura do texto apresenta consistência com os padrões formais de comunicação institucional e agências oficiais do país.",
            negatives: [],
            positives: ["Linguagem estritamente objetiva", "Presença de dados verificáveis", "Referências a fontes identificáveis"]
        }
    ];

    if (analysisForm) {
        analysisForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!newsInput) return;
            const text = newsInput.value.trim();

            if (!text) {
                alert("Por favor, insira um texto ou link para verificação.");
                return;
            }

            // Ativa o estado de carregamento simulando a IA
            if (resultCard) resultCard.style.display = 'none';
            if (loadingSpinner) loadingSpinner.style.display = 'block';

            setTimeout(() => {
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                analyzeText(text);
            }, 2000); // 2 segundos de varredura técnica
        });
    }

    function analyzeText(text) {
        const lowerText = text.toLowerCase();
        let finalAnalysis = null;

        // 1. Verificação na Base de Boatos Conhecidos
        for (const hoax of localHoaxDatabase) {
            const matches = hoax.keywords.every(keyword => lowerText.includes(keyword));
            if (matches) {
                finalAnalysis = hoax;
                break;
            }
        }

        // 2. Se não bater com nenhum boato, roda o Algoritmo de Métricas Heurísticas
        if (!finalAnalysis) {
            let score = 60; // Pontuação base neutra
            let negatives = [];
            let positives = [];

            // Análise de Sinais de Desinformação
            if (lowerText.includes("!!!") || lowerText.includes("urgente") || lowerText.includes("atenção")) {
                score -= 15;
                negatives.push("Sensacionalismo / Tom alarmista detetado");
            }
            if (lowerText.includes("partilhe") || lowerText.includes("repassem") || lowerText.includes("5 grupos")) {
                score -= 20;
                negatives.push("Indução mecânica à viralização (Corrente)");
            }
            if (lowerText.includes(".xyz") || lowerText.includes(".site") || lowerText.includes(".click")) {
                score -= 25;
                negatives.push("Estrutura de Link Maliciosa para Roubo de Dados");
            }

            // Identificação de Sinais Positivos
            if (lowerText.includes("segundo") || lowerText.includes("fonte") || lowerText.includes("de acordo com")) {
                score += 15;
                positives.push("Tentativa de atribuição ou citação de fontes");
            }
            if (lowerText.includes("dados") || lowerText.includes("relatório") || lowerText.includes("%")) {
                score += 15;
                positives.push("Presença de dados quantitativos ou estatísticos");
            }

            // Limitar os extremos do Score
            score = Math.max(0, Math.min(100, score));

            // Classificação por Níveis Oficiais
            let level = "Moderada Confiabilidade";
            let color = "#ffc107";

            if (score >= 85) {
                level = "Alta Confiabilidade";
                color = "#28a745";
            } else if (score >= 65) {
                level = "Boa Confiabilidade";
                color = "#2b8a3e";
            } else if (score >= 40) {
                level = "Moderada Confiabilidade";
                color = "#ffc107";
            } else if (score >= 20) {
                level = "Baixa Confiabilidade";
                color = "#fd7e14";
            } else {
                level = "Muito Baixa Confiabilidade";
                color = "#dc3545";
            }

            finalAnalysis = {
                score: score,
                level: level,
                color: color,
                explanation: `A análise heurística atribuiu a nota ${score}/100 baseada na estrutura formal do texto introduzido.`,
                negatives: negatives,
                positives: positives
            };
        }

        // Renderização Dinâmica dos Resultados no Ecrã
        renderResults(finalAnalysis);
    }

    function renderResults(analysis) {
        const scoreValue = document.querySelector('#scoreValue');
        const progressBar = document.querySelector('#progressBar');
        const levelBadge = document.querySelector('#levelBadge');
        const explanationText = document.querySelector('#explanationText');
        const negativeList = document.querySelector('#negativeList');
        const positiveList = document.querySelector('#positiveList');

        if (scoreValue) scoreValue.textContent = `${analysis.score}/100`;
        if (progressBar) {
            progressBar.style.width = `${analysis.score}%`;
            progressBar.style.backgroundColor = analysis.color;
        }
        if (levelBadge) {
            levelBadge.textContent = analysis.level;
            levelBadge.style.backgroundColor = analysis.color;
        }
        if (explanationText) explanationText.textContent = analysis.explanation;

        if (negativeList) {
            negativeList.innerHTML = '';
            if (analysis.negatives.length === 0) {
                negativeList.innerHTML = '<li>Nenhum sinal crítico detetado.</li>';
            } else {
                analysis.negatives.forEach(item => {
                    negativeList.innerHTML += `<li style="color: #dc3545; list-style: none; margin: 5px 0;">⚠️ ${item}</li>`;
                });
            }
        }

        if (positiveList) {
            positiveList.innerHTML = '';
            if (analysis.positives.length === 0) {
                positiveList.innerHTML = '<li>Nenhum indicador de validação formal encontrado.</li>';
            } else {
                analysis.positives.forEach(item => {
                    positiveList.innerHTML += `<li style="color: #28a745; list-style: none; margin: 5px 0;">✅ ${item}</li>`;
                });
            }
        }

        if (resultCard) resultCard.style.display = 'block';
    }
});
