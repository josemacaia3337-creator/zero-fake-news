// =================================================================
// ZERO FAKE NEWS - MOTOR COM HISTÓRICO E PESQUISA (ETAPA 3)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const analysisForm = document.querySelector('#analysisForm') || document.querySelector('form');
    const newsInput = document.querySelector('#newsInput') || document.querySelector('textarea');
    const resultCard = document.querySelector('#resultCard') || document.querySelector('.result-section');
    const loadingSpinner = document.querySelector('#loadingSpinner') || document.querySelector('.loading');
    
    // Elementos da Etapa 3 (Histórico e Pesquisa)
    const historyList = document.querySelector('#historyList');
    const searchHistory = document.querySelector('#searchHistory');
    const totalAnalysesCount = document.querySelector('#totalAnalysesCount');
    const averageCredibility = document.querySelector('#averageCredibility');

    // Base de dados de boatos conhecidos em Angola
    const localHoaxDatabase = [
        {
            keywords: ["bónus", "kwanzas", "governo", "subsídio"],
            score: 12,
            level: "Muito Baixa Confiabilidade",
            color: "#dc3545",
            explanation: "Este conteúdo corresponde a um golpe cibernético clássico de phishing que circula no WhatsApp, prometendo falsos subsídios estatais para roubar dados dos cidadãos. O Governo de Angola já desmentiu oficialmente esta campanha.",
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

    // Repositório de Análises Simuladas para o Histórico (Requisitos 10, 11 e 13)
    let analysisHistory = [
        {
            id: 1,
            title: "Falso bónus de 50.000 Kz atribuído ao Governo",
            text: "O governo está a dar um bónus de 50000 kwanzas para todos os cidadãos. Insira os seus dados no link urgente!!!",
            score: 12,
            level: "Muito Baixa Confiabilidade",
            color: "#dc3545",
            date: "08/06/2026",
            explanation: "Este conteúdo corresponde a um golpe cibernético clássico de phishing que circula no WhatsApp, prometendo falsos subsídios estatais. O Governo de Angola já desmentiu oficialmente esta campanha.",
            negatives: ["Ausência de fontes oficiais", "Promessas de ganho fácil", "Uso de links não governamentais (.xyz)"],
            positives: []
        },
        {
            id: 2,
            title: "Comunicado Oficial da Agência ANGOP sobre Economia",
            text: "Segundo o relatório oficial emitido pela ANGOP, a taxa de inflação registou uma quebra de 2% no último trimestre de acordo com dados do BNA.",
            score: 95,
            level: "Alta Confiabilidade",
            color: "#28a745",
            date: "07/06/2026",
            explanation: "A estrutura do texto apresenta consistência com os padrões formais de comunicação institucional e agências oficiais do país.",
            negatives: [],
            positives: ["Linguagem estritamente objetiva", "Presença de dados verificáveis", "Referências a fontes identificáveis"]
        },
        {
            id: 3,
            title: "Vagas urgentes na Sonangol sem experiência",
            text: "Grande recrutamento urgente na Sonangol!!! Mais de 500 vagas para entrada imediata sem experiência necessária. Partilhe com 5 grupos para validar a sua inscrição.",
            score: 25,
            level: "Baixa Confiabilidade",
            color: "#fd7e14",
            date: "05/06/2026",
            explanation: "Uso explícito de táticas de engenharia social (indução mecânica à partilha em massa) e promessas extraordinárias fora dos canais formais da empresa.",
            negatives: ["Indução mecânica à viralização (Corrente)", "Tom alarmista / Sensacionalismo detetado"],
            positives: []
        }
    ];

    // Inicializar o Dashboard Lateral
    function updateDashboard(filterKeyword = "") {
        if (!historyList) return;
        historyList.innerHTML = "";

        const filtered = analysisHistory.filter(item => 
            item.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
            item.text.toLowerCase().includes(filterKeyword.toLowerCase())
        );

        filtered.forEach(item => {
            const li = document.createElement('li');
            li.style.padding = "10px";
            li.style.borderBottom = "1px solid #eee";
            li.style.cursor = "pointer";
            li.style.listStyle = "none";
            li.innerHTML = `
                <div style="font-weight: bold; font-size: 14px; color: #333;">${item.title}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 12px;">
                    <span style="color: ${item.color}; font-weight: bold;">${item.level} (${item.score}/100)</span>
                    <span style="color: #777;">${item.date}</span>
                </div>
            `;
            // Evento de clique para recarregar a análise antiga no ecrã principal
            li.addEventListener('click', () => {
                if (newsInput) newsInput.value = item.text;
                renderResults(item);
            });
            historyList.appendChild(li);
        });

        // Atualizar Métricas Estatísticas Básicas (Requisito 11)
        if (totalAnalysesCount) totalAnalysesCount.textContent = analysisHistory.length;
        if (averageCredibility) {
            const totalScore = analysisHistory.reduce((sum, item) => sum + item.score, 0);
            const avg = analysisHistory.length ? Math.round(totalScore / analysisHistory.length) : 0;
            averageCredibility.textContent = `${avg}/100`;
        }
    }

    // Ouvinte para a Barra de Pesquisa do Histórico (Requisito 13)
    if (searchHistory) {
        searchHistory.addEventListener('input', (e) => {
            updateDashboard(e.target.value.trim());
        });
    }

    if (analysisForm) {
        analysisForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!newsInput) return;
            const text = newsInput.value.trim();

            if (!text) {
                alert("Por favor, insira um texto ou link para verificação.");
                return;
            }

            if (resultCard) resultCard.style.display = 'none';
            if (loadingSpinner) loadingSpinner.style.display = 'block';

            setTimeout(() => {
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                analyzeText(text);
            }, 2000);
        });
    }

    function analyzeText(text) {
        const lowerText = text.toLowerCase();
        let finalAnalysis = null;

        for (const hoax of localHoaxDatabase) {
            const matches = hoax.keywords.every(keyword => lowerText.includes(keyword));
            if (matches) {
                finalAnalysis = JSON.parse(JSON.stringify(hoax));
                break;
            }
        }

        if (!finalAnalysis) {
            let score = 60;
            let negatives = [];
            let positives = [];

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

            if (lowerText.includes("segundo") || lowerText.includes("fonte") || lowerText.includes("de acordo com")) {
                score += 15;
                positives.push("Tentativa de atribuição ou citação de fontes");
            }
            if (lowerText.includes("dados") || lowerText.includes("relatório") || lowerText.includes("%")) {
                score += 15;
                positives.push("Presença de dados quantitativos ou estatísticos");
            }

            score = Math.max(0, Math.min(100, score));

            let level = "Moderada Confiabilidade";
            let color = "#ffc107";

            if (score >= 85) { level = "Alta Confiabilidade"; color = "#28a745"; }
            else if (score >= 65) { level = "Boa Confiabilidade"; color = "#2b8a3e"; }
            else if (score >= 40) { level = "Moderada Confiabilidade"; color = "#ffc107"; }
            else if (score >= 20) { level = "Baixa Confiabilidade"; color = "#fd7e14"; }
            else { level = "Muito Baixa Confiabilidade"; color = "#dc3545"; }

            finalAnalysis = {
                score: score,
                level: level,
                color: color,
                explanation: `A análise heurística atribuiu a nota ${score}/100 baseada na estrutura formal do texto introduzido.`,
                negatives: negatives,
                positives: positives
            };
        }

        // Adicionar a nova análise ao topo do histórico dinamicamente
        const truncateTitle = text.length > 40 ? text.substring(0, 40) + "..." : text;
        const newRecord = {
            id: Date.now(),
            title: truncateTitle,
            text: text,
            score: finalAnalysis.score,
            level: finalAnalysis.level,
            color: finalAnalysis.color,
            date: "Hoje",
            explanation: finalAnalysis.explanation,
            negatives: finalAnalysis.negatives,
            positives: finalAnalysis.positives
        };
        
        analysisHistory.unshift(newRecord);
        updateDashboard();
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

    // Inicialização automática do painel lateral
    updateDashboard();
});
