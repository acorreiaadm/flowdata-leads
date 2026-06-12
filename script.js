let leads = JSON.parse(localStorage.getItem("flowdataLeadsV4")) || [];

const form = document.getElementById("leadForm");
const listaLeads = document.getElementById("listaLeads");

const filtroCidade = document.getElementById("filtroCidade");
const filtroNicho = document.getElementById("filtroNicho");
const filtroStatus = document.getElementById("filtroStatus");
const filtroPotencial = document.getElementById("filtroPotencial");

const csvFile = document.getElementById("csvFile");
const btnImportar = document.getElementById("btnImportar");

form.addEventListener("submit", function (event) {
  event.preventDefault();

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
  lead.diagnostico = gerarDiagnostico(lead);

  leads.push(lead);

  salvarLeads();
  renderizarLeads();
  atualizarDashboard();

  form.reset();
});

btnImportar.addEventListener("click", function () {
  const arquivo = csvFile.files[0];

  if (!arquivo) {
    alert("Selecione um arquivo CSV primeiro.");
    return;
  }

  const leitor = new FileReader();

  leitor.onload = function (event) {
    const conteudo = event.target.result;
    importarCSV(conteudo);
  };

  leitor.readAsText(arquivo, "UTF-8");
});

function valor(id) {
  return document.getElementById(id).value.trim();
}

function marcado(id) {
  return document.getElementById(id).checked;
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

function gerarDiagnostico(lead) {
  let diagnostico = [];

  if (!lead.temSite) {
    diagnostico.push("A empresa não possui um site profissional ou o site não está sendo usado como ferramenta de vendas.");
  }

  if (!lead.temWhatsapp) {
    diagnostico.push("O WhatsApp não está visível de forma clara, o que pode reduzir contatos de novos clientes.");
  }

  if (!lead.instagramAtivo) {
    diagnostico.push("O Instagram parece pouco ativo ou sem uma estratégia clara de conteúdo.");
  }

  if (!lead.googleAtualizado) {
    diagnostico.push("O perfil do Google pode estar desatualizado, com poucas fotos, informações incompletas ou baixa otimização.");
  }

  if (!lead.identidadeVisual) {
    diagnostico.push("A identidade visual pode ser melhorada para transmitir mais confiança e profissionalismo.");
  }

  if (diagnostico.length === 0) {
    diagnostico.push("A empresa possui uma boa presença digital. A oportunidade pode estar em campanhas, manutenção ou melhorias específicas.");
  }

  return diagnostico.join(" ");
}

function salvarLeads() {
  localStorage.setItem("flowdataLeadsV4", JSON.stringify(leads));
}

function importarCSV(conteudo) {
  const linhas = conteudo.split("\n").filter(linha => linha.trim() !== "");

  if (linhas.length <= 1) {
    alert("CSV vazio ou inválido.");
    return;
  }

  const cabecalho = linhas[0].split(",").map(coluna => coluna.trim());

  for (let i = 1; i < linhas.length; i++) {
    const valores = linhas[i].split(",").map(valor => valor.trim());

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
      temSite: dados.site ? true : false,
      temWhatsapp: dados.telefone ? true : false,
      instagramAtivo: dados.instagram ? true : false,
      googleAtualizado: dados.googleMaps ? true : false,
      identidadeVisual: false,
      data: new Date().toLocaleDateString("pt-BR")
    };

    lead.notaDigital = calcularNotaDigital(lead);
    lead.potencialVenda = calcularPotencialVenda(lead.notaDigital);
    lead.diagnostico = gerarDiagnostico(lead);

    leads.push(lead);
  }

  salvarLeads();
  renderizarLeads();
  atualizarDashboard();

  csvFile.value = "";

  alert("Leads importados com sucesso!");
}

function renderizarLeads() {
  listaLeads.innerHTML = "";

  const cidadeFiltro = filtroCidade.value.toLowerCase();
  const nichoFiltro = filtroNicho.value;
  const statusFiltro = filtroStatus.value;
  const potencialFiltro = filtroPotencial.value;

  const leadsFiltrados = leads.filter(function (lead) {
    return (
      lead.cidade.toLowerCase().includes(cidadeFiltro) &&
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

      <span class="badge ${lead.potencialVenda.toLowerCase()}">
        Potencial de Venda: ${lead.potencialVenda} | Nota Digital: ${lead.notaDigital}/10
      </span>

      <p><strong>Cidade:</strong> ${lead.cidade}</p>
      <p><strong>Nicho:</strong> ${lead.nicho}</p>
      <p><strong>Origem:</strong> ${lead.origem}</p>
      <p><strong>Telefone:</strong> ${lead.telefone || "Não informado"}</p>
      <p><strong>Status:</strong> ${lead.status}</p>
      <p><strong>Serviço indicado:</strong> ${lead.servico}</p>
      <p><strong>Valor sugerido:</strong> ${lead.valorProposta || "Não informado"}</p>
      <p><strong>Próximo contato:</strong> ${formatarData(lead.proximoContato)}</p>
      <p><strong>Problemas informados:</strong> ${lead.problemas || "Não informado"}</p>
      <p><strong>Observações:</strong> ${lead.observacoes || "Sem observações"}</p>
      <p><strong>Cadastrado em:</strong> ${lead.data}</p>

      <div class="diagnostico">
        <h4>Diagnóstico Automático</h4>
        <p>${lead.diagnostico}</p>
      </div>

      <div class="acoes">
        ${lead.telefone ? `<a class="btn-whats" target="_blank" href="${gerarLinkWhatsApp(lead)}">WhatsApp</a>` : ""}
        <button class="btn-status" onclick="alterarStatus(${lead.id})">Alterar Status</button>
        <button class="btn-excluir" onclick="excluirLead(${lead.id})">Excluir</button>
      </div>
    `;

    listaLeads.appendChild(div);
  });
}

function gerarLinkWhatsApp(lead) {
  let telefone = lead.telefone.replace(/\D/g, "");

  if (!telefone.startsWith("55")) {
    telefone = "55" + telefone;
  }

  const mensagem = `
Olá, tudo bem? Me chamo Adriele, sou da FlowData.

Fiz uma análise rápida da presença digital da ${lead.empresa} e percebi alguns pontos que podem estar reduzindo contatos pelo WhatsApp.

Diagnóstico:
${lead.diagnostico}

Serviço que acredito que poderia ajudar:
${lead.servico}

Posso te mostrar essa análise gratuita e objetiva?
`;

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

function alterarStatus(id) {
  const lead = leads.find(function (item) {
    return item.id === id;
  });

  const novoStatus = prompt(
    "Digite o novo status: Lead Novo, Primeiro Contato, Interessado, Reunião, Proposta, Fechado ou Perdido",
    lead.status
  );

  if (novoStatus) {
    lead.status = novoStatus;
    salvarLeads();
    renderizarLeads();
    atualizarDashboard();
  }
}

function excluirLead(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este lead?");

  if (confirmar) {
    leads = leads.filter(function (lead) {
      return lead.id !== id;
    });

    salvarLeads();
    renderizarLeads();
    atualizarDashboard();
  }
}

function formatarData(data) {
  if (!data) return "Não definido";

  const partes = data.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function converterValor(valorTexto) {
  if (!valorTexto) return 0;

  return Number(
    valorTexto
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  ) || 0;
}

function atualizarDashboard() {
  document.getElementById("totalLeads").textContent = leads.length;

  document.getElementById("potencialAlto").textContent =
    leads.filter(l => l.potencialVenda === "Alto").length;

  document.getElementById("potencialMedio").textContent =
    leads.filter(l => l.potencialVenda === "Médio").length;

  document.getElementById("potencialBaixo").textContent =
    leads.filter(l => l.potencialVenda === "Baixo").length;

  const total = leads.reduce(function (soma, lead) {
    return soma + converterValor(lead.valorProposta);
  }, 0);

  document.getElementById("valorPotencial").textContent =
    total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
}

filtroCidade.addEventListener("input", renderizarLeads);
filtroNicho.addEventListener("change", renderizarLeads);
filtroStatus.addEventListener("change", renderizarLeads);
filtroPotencial.addEventListener("change", renderizarLeads);

renderizarLeads();
atualizarDashboard();
