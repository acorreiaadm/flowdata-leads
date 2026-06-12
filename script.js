// FlowData CRM Pro - Versão consolidada
let leads = JSON.parse(localStorage.getItem("flowdataCRMProV1")) || [];

const $ = (id) => document.getElementById(id);

const form = $("leadForm");
const listaLeads = $("listaLeads");

const filtroCidade = $("filtroCidade");
const filtroNicho = $("filtroNicho");
const filtroStatus = $("filtroStatus");
const filtroPotencial = $("filtroPotencial");

const csvFile = $("csvFile");
const btnImportar = $("btnImportar");

function valor(id) {
  const elemento = $(id);
  return elemento ? elemento.value.trim() : "";
}

function marcado(id) {
  const elemento = $(id);
  return elemento ? elemento.checked : false;
}

function salvarLeads() {
  localStorage.setItem("flowdataCRMProV1", JSON.stringify(leads));
}

function calcularNotaDigital(lead) {
  let nota = 0;

  if (lead.temSite) nota += 2;
  if (lead.temWhatsapp) nota += 2;
  if (lead.instagramAtivo) nota += 2;
  if (lead.googleAtualizado) nota += 2;
  if (lead.identidadeVisual) nota += 2;

  return nota;
}

function calcularPotencialVenda(nota) {
  if (nota <= 3) return "Alto";
  if (nota <= 6) return "Médio";
  return "Baixo";
}

function sugerirServico(lead) {
  if (!lead.temSite && !lead.googleAtualizado) return "Landing Page + Google Business";
  if (!lead.temSite) return "Landing Page";
  if (!lead.googleAtualizado) return "Google Business";
  if (!lead.instagramAtivo || !lead.identidadeVisual) return "Plano Mensal";
  return lead.servico || "Consultoria Digital";
}

function gerarDiagnostico(lead) {
  const diagnostico = [];

  if (!lead.temSite) {
    diagnostico.push("A empresa não possui um site profissional ou não usa o site como ferramenta clara de vendas.");
  }

  if (!lead.temWhatsapp) {
    diagnostico.push("O WhatsApp não está visível de forma clara, o que pode reduzir novos contatos.");
  }

  if (!lead.instagramAtivo) {
    diagnostico.push("O Instagram parece pouco ativo ou sem estratégia de conteúdo.");
  }

  if (!lead.googleAtualizado) {
    diagnostico.push("O Google Business pode estar desatualizado, com poucas fotos ou informações incompletas.");
  }

  if (!lead.identidadeVisual) {
    diagnostico.push("A identidade visual pode ser melhorada para transmitir mais confiança.");
  }

  if (lead.problemas) {
    diagnostico.push("Observação manual: " + lead.problemas);
  }

  if (diagnostico.length === 0) {
    diagnostico.push("A empresa possui boa presença digital. A oportunidade pode estar em campanhas, manutenção ou melhoria de conversão.");
  }

  return diagnostico.join(" ");
}

function criarLeadManual() {
  const lead = {
    id: Date.now(),
    empresa: valor("empresa"),
    cidade: valor("cidade"),
    nicho: valor("nicho"),
    telefone: valor("telefone"),
    site: valor("site"),
    instagram: valor("instagram"),
    googleMaps: valor("googleMaps"),
    origem: valor("origem"),
    status: valor("status"),
    servico: valor("servico"),
    valorProposta: valor("valor"),
    proximoContato: valor("proximoContato"),
    problemas: valor("problemas"),
    observacoes: valor("observacoes"),
    temSite: marcado("temSite"),
    temWhatsapp: marcado("temWhatsapp"),
    instagramAtivo: marcado("instagramAtivo"),
    googleAtualizado: marcado("googleAtualizado"),
    identidadeVisual: marcado("identidadeVisual"),
    data: new Date().toLocaleDateString("pt-BR")
  };

  lead.notaDigital = calcularNotaDigital(lead);
  lead.potencialVenda = calcularPotencialVenda(lead.notaDigital);
  lead.servico = lead.servico || sugerirServico(lead);
  lead.diagnostico = gerarDiagnostico(lead);

  return lead;
}

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const lead = criarLeadManual();

    if (!lead.empresa || !lead.cidade || !lead.nicho) {
      alert("Preencha empresa, cidade e nicho.");
      return;
    }

    leads.push(lead);
    salvarLeads();
    renderizarTudo();
    form.reset();
  });
}

function normalizarTexto(texto) {
  return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function renderizarLeads() {
  if (!listaLeads) return;

  listaLeads.innerHTML = "";

  const cidadeFiltro = normalizarTexto(filtroCidade ? filtroCidade.value : "");
  const nichoFiltro = filtroNicho ? filtroNicho.value : "";
  const statusFiltro = filtroStatus ? filtroStatus.value : "";
  const potencialFiltro = filtroPotencial ? filtroPotencial.value : "";

  const leadsFiltrados = leads.filter(function (lead) {
    return (
      normalizarTexto(lead.cidade).includes(cidadeFiltro) &&
      (nichoFiltro === "" || lead.nicho === nichoFiltro) &&
      (statusFiltro === "" || lead.status === statusFiltro) &&
      (potencialFiltro === "" || lead.potencialVenda === potencialFiltro)
    );
  });

  if (leadsFiltrados.length === 0) {
    listaLeads.innerHTML = "<p>Nenhum lead encontrado.</p>";
    return;
  }

  leadsFiltrados.forEach(function (lead) {
    const div = document.createElement("div");
    div.className = "lead";

    div.innerHTML = `
      <h3>${lead.empresa}</h3>

      <span class="badge ${normalizarClasse(lead.potencialVenda)}">
        Potencial de Venda: ${lead.potencialVenda} | Nota Digital: ${lead.notaDigital}/10
      </span>

      <p><strong>Cidade:</strong> ${lead.cidade || "Não informado"}</p>
      <p><strong>Nicho:</strong> ${lead.nicho || "Não informado"}</p>
      <p><strong>Origem:</strong> ${lead.origem || "Não informado"}</p>
      <p><strong>Telefone:</strong> ${lead.telefone || "Não informado"}</p>
      <p><strong>Status:</strong> ${lead.status || "Lead Novo"}</p>
      <p><strong>Serviço indicado:</strong> ${lead.servico || "Não informado"}</p>
      <p><strong>Valor sugerido:</strong> ${lead.valorProposta || "Não informado"}</p>
      <p><strong>Próximo contato:</strong> ${formatarData(lead.proximoContato)}</p>
      <p><strong>Cadastrado em:</strong> ${lead.data || "Não informado"}</p>

      <div class="diagnostico">
        <h4>Diagnóstico Automático</h4>
        <p>${lead.diagnostico || "Sem diagnóstico."}</p>
      </div>

      <div class="acoes">
        ${lead.telefone ? `<a class="btn-whats" target="_blank" href="${gerarLinkWhatsApp(lead)}">WhatsApp</a>` : ""}
        <button class="btn-status" onclick="alterarStatus(${lead.id})">Alterar Status</button>
        <button class="btn-pdf" onclick="gerarPDF(${lead.id})">Gerar PDF</button>
        <button class="btn-excluir" onclick="excluirLead(${lead.id})">Excluir</button>
      </div>
    `;

    listaLeads.appendChild(div);
  });
}

function normalizarClasse(texto) {
  return normalizarTexto(texto).replace("medio", "medio");
}

function atualizarDashboard() {
  setText("totalLeads", leads.length);

  setText("potencialAlto", leads.filter(l => l.potencialVenda === "Alto").length);
  setText("potencialMedio", leads.filter(l => l.potencialVenda === "Médio").length);
  setText("potencialBaixo", leads.filter(l => l.potencialVenda === "Baixo").length);

  const total = leads.reduce(function (soma, lead) {
    return soma + converterValor(lead.valorProposta);
  }, 0);

  setText("valorPotencial", total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  }));
}

function atualizarFunil() {
  setText("funilNovo", contarStatus("Lead Novo"));
  setText("funilContato", contarStatus("Primeiro Contato"));
  setText("funilInteressado", contarStatus("Interessado"));
  setText("funilReuniao", contarStatus("Reunião"));
  setText("funilProposta", contarStatus("Proposta"));
  setText("funilFechado", contarStatus("Fechado"));
}

function contarStatus(status) {
  return leads.filter(lead => lead.status === status).length;
}

function setText(id, texto) {
  const el = $(id);
  if (el) el.textContent = texto;
}

function converterValor(valorTexto) {
  if (!valorTexto) return 0;

  return Number(
    String(valorTexto)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  ) || 0;
}

function formatarData(data) {
  if (!data) return "Não definido";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function alterarStatus(id) {
  const lead = leads.find(item => item.id === id);

  if (!lead) {
    alert("Lead não encontrado.");
    return;
  }

  const novoStatus = prompt(
    "Digite o novo status: Lead Novo, Primeiro Contato, Interessado, Reunião, Proposta, Fechado ou Perdido",
    lead.status
  );

  if (novoStatus) {
    lead.status = novoStatus;
    salvarLeads();
    renderizarTudo();
  }
}

function excluirLead(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este lead?");

  if (!confirmar) return;

  leads = leads.filter(lead => lead.id !== id);
  salvarLeads();
  renderizarTudo();
}

function gerarLinkWhatsApp(lead) {
  let telefone = String(lead.telefone || "").replace(/\D/g, "");

  if (!telefone.startsWith("55")) {
    telefone = "55" + telefone;
  }

  const mensagem = `Olá, tudo bem? Me chamo Adriele, sou da FlowData.

Fiz uma análise rápida da presença digital da ${lead.empresa} e percebi alguns pontos que podem estar reduzindo contatos pelo WhatsApp.

Diagnóstico:
${lead.diagnostico}

Serviço que acredito que poderia ajudar:
${lead.servico}

Posso te mostrar essa análise gratuita e objetiva?`;

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

if (btnImportar) {
  btnImportar.addEventListener("click", function () {
    const arquivo = csvFile && csvFile.files ? csvFile.files[0] : null;

    if (!arquivo) {
      alert("Selecione um arquivo CSV primeiro.");
      return;
    }

    const leitor = new FileReader();

    leitor.onload = function (event) {
      importarCSV(event.target.result);
    };

    leitor.readAsText(arquivo, "UTF-8");
  });
}

function importarCSV(conteudo) {
  const linhas = conteudo.split(/\r?\n/).filter(linha => linha.trim() !== "");

  if (linhas.length <= 1) {
    alert("CSV vazio ou inválido.");
    return;
  }

  const cabecalho = parseCSVLine(linhas[0]).map(coluna => coluna.trim());

  let importados = 0;

  for (let i = 1; i < linhas.length; i++) {
    const valores = parseCSVLine(linhas[i]).map(valor => valor.trim());

    const dados = {};
    cabecalho.forEach(function (coluna, index) {
      dados[coluna] = valores[index] || "";
    });

    const lead = {
      id: Date.now() + i,
      empresa: dados.empresa || "Empresa sem nome",
      cidade: dados.cidade || "",
      nicho: dados.nicho || "Outro",
      telefone: dados.telefone || "",
      site: dados.site || "",
      instagram: dados.instagram || "",
      googleMaps: dados.googleMaps || "",
      origem: "CSV",
      status: "Lead Novo",
      servico: "Landing Page + Google Business",
      valorProposta: dados.valor || "",
      proximoContato: "",
      problemas: "Lead importado via CSV. Avaliação manual pendente.",
      observacoes: "",
      temSite: Boolean(dados.site),
      temWhatsapp: Boolean(dados.telefone),
      instagramAtivo: Boolean(dados.instagram),
      googleAtualizado: Boolean(dados.googleMaps),
      identidadeVisual: false,
      data: new Date().toLocaleDateString("pt-BR")
    };

    lead.notaDigital = calcularNotaDigital(lead);
    lead.potencialVenda = calcularPotencialVenda(lead.notaDigital);
    lead.servico = sugerirServico(lead);
    lead.diagnostico = gerarDiagnostico(lead);

    leads.push(lead);
    importados++;
  }

  salvarLeads();
  renderizarTudo();

  if (csvFile) csvFile.value = "";

  alert(`${importados} leads importados com sucesso!`);
}

function parseCSVLine(line) {
  const resultado = [];
  let atual = "";
  let dentroAspas = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      dentroAspas = !dentroAspas;
    } else if (char === "," && !dentroAspas) {
      resultado.push(atual);
      atual = "";
    } else {
      atual += char;
    }
  }

  resultado.push(atual);
  return resultado;
}

function gerarPDF(id) {
  const lead = leads.find(item => item.id === id);

  if (!lead) {
    alert("Lead não encontrado.");
    return;
  }

  if (!window.jspdf) {
    alert("Biblioteca PDF não carregou. Verifique sua internet e atualize a página.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Relatório Comercial FlowData", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let y = 35;

  const linhas = [
    `Empresa: ${lead.empresa}`,
    `Cidade: ${lead.cidade}`,
    `Nicho: ${lead.nicho}`,
    `Origem: ${lead.origem}`,
    `Status: ${lead.status}`,
    `Nota Digital: ${lead.notaDigital}/10`,
    `Potencial de Venda: ${lead.potencialVenda}`,
    `Serviço Indicado: ${lead.servico}`,
    `Valor Sugerido: ${lead.valorProposta || "Não informado"}`
  ];

  linhas.forEach(function (linha) {
    doc.text(linha, 20, y);
    y += 7;
  });

  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("Diagnóstico:", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  const diagnostico = doc.splitTextToSize(lead.diagnostico || "Não informado", 170);
  doc.text(diagnostico, 20, y);
  y += diagnostico.length * 7 + 8;

  doc.setFont("helvetica", "bold");
  doc.text("Recomendação FlowData:", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  const recomendacao = `Com base na análise, recomendamos o serviço de ${lead.servico} para melhorar a presença digital, aumentar a confiança e facilitar novos contatos pelo WhatsApp.`;
  const textoRecomendacao = doc.splitTextToSize(recomendacao, 170);
  doc.text(textoRecomendacao, 20, y);

  const nomeArquivo = `Relatorio-${lead.empresa}`.replace(/[^\w\-]+/g, "-");
  doc.save(`${nomeArquivo}.pdf`);
}

function renderizarTudo() {
  renderizarLeads();
  atualizarDashboard();
  atualizarFunil();
  renderizarKanban();
}

[filtroCidade, filtroNicho, filtroStatus, filtroPotencial].forEach(function (filtro) {
  if (filtro) {
    filtro.addEventListener("input", renderizarLeads);
    filtro.addEventListener("change", renderizarLeads);
  }
});

renderizarTudo();

function renderizarKanban() {
  const colunas = {
    "Lead Novo": document.getElementById("colunaLeadNovo"),
    "Primeiro Contato": document.getElementById("colunaContato"),
    "Interessado": document.getElementById("colunaInteressado"),
    "Proposta": document.getElementById("colunaProposta"),
    "Fechado": document.getElementById("colunaFechado")
  };

  Object.values(colunas).forEach(coluna => {
    if (coluna) coluna.innerHTML = "";
  });

  leads.forEach(lead => {
    const card = document.createElement("div");
    card.className = "kanban-card";
    card.draggable = true;
    card.dataset.id = lead.id;

    card.innerHTML = `
      <h4>${lead.empresa}</h4>
      <p>${lead.cidade}</p>
      <p>${lead.potencialVenda}</p>
    `;

    card.addEventListener("dragstart", function () {
      card.classList.add("arrastando");
    });

    card.addEventListener("dragend", function () {
      card.classList.remove("arrastando");
    });

    const coluna = colunas[lead.status];

    if (coluna) {
      coluna.appendChild(card);
    }
  });

  Object.keys(colunas).forEach(status => {
    const coluna = colunas[status];

    if (!coluna) return;

    coluna.addEventListener("dragover", function (event) {
      event.preventDefault();
      coluna.classList.add("coluna-hover");
    });

    coluna.addEventListener("dragleave", function () {
      coluna.classList.remove("coluna-hover");
    });

    coluna.addEventListener("drop", function (event) {
      event.preventDefault();

      const cardArrastando = document.querySelector(".arrastando");

      if (!cardArrastando) return;

      const id = Number(cardArrastando.dataset.id);
      const lead = leads.find(item => item.id === id);

      if (lead) {
        lead.status = status;
        salvarLeads();
        renderizarTudo();
      }

      coluna.classList.remove("coluna-hover");
    });
  });
}
