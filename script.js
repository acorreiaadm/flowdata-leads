let leads = JSON.parse(localStorage.getItem("flowdataLeads")) || [];

const form = document.getElementById("leadForm");
const listaLeads = document.getElementById("listaLeads");

const filtroCidade = document.getElementById("filtroCidade");
const filtroNicho = document.getElementById("filtroNicho");
const filtroStatus = document.getElementById("filtroStatus");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const lead = {
    id: Date.now(),
    empresa: pegarValor("empresa"),
    cidade: pegarValor("cidade"),
    nicho: pegarValor("nicho"),
    telefone: pegarValor("telefone"),
    site: pegarValor("site"),
    instagram: pegarValor("instagram"),
    googleMaps: pegarValor("googleMaps"),
    status: pegarValor("status"),
    servico: pegarValor("servico"),
    valor: pegarValor("valor"),
    problemas: pegarValor("problemas"),
    observacoes: pegarValor("observacoes"),
    temSite: document.getElementById("temSite").checked,
    temWhatsapp: document.getElementById("temWhatsapp").checked,
    instagramAtivo: document.getElementById("instagramAtivo").checked,
    googleAtualizado: document.getElementById("googleAtualizado").checked,
    identidadeVisual: document.getElementById("identidadeVisual").checked,
    data: new Date().toLocaleDateString("pt-BR")
  };

  lead.notaDigital = calcularNotaDigital(lead);
  lead.potencial = classificarPotencial(lead.notaDigital);

  leads.push(lead);

  salvarLeads();
  renderizarLeads();
  atualizarDashboard();

  form.reset();
});

function pegarValor(id) {
  return document.getElementById(id).value.trim();
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

function classificarPotencial(nota) {
  if (nota <= 3) return "Quente";
  if (nota <= 6) return "Médio";
  return "Frio";
}

function salvarLeads() {
  localStorage.setItem("flowdataLeads", JSON.stringify(leads));
}

function renderizarLeads() {
  listaLeads.innerHTML = "";

  const cidadeFiltro = filtroCidade.value.toLowerCase();
  const nichoFiltro = filtroNicho.value;
  const statusFiltro = filtroStatus.value;

  const leadsFiltrados = leads.filter(function (lead) {
    return (
      lead.cidade.toLowerCase().includes(cidadeFiltro) &&
      (nichoFiltro === "" || lead.nicho === nichoFiltro) &&
      (statusFiltro === "" || lead.status === statusFiltro)
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

      <span class="badge ${lead.potencial.toLowerCase()}">
        ${lead.potencial} | Nota Digital: ${lead.notaDigital}/10
      </span>

      <p><strong>Cidade:</strong> ${lead.cidade}</p>
      <p><strong>Nicho:</strong> ${lead.nicho}</p>
      <p><strong>Telefone:</strong> ${lead.telefone || "Não informado"}</p>
      <p><strong>Status:</strong> ${lead.status}</p>
      <p><strong>Serviço indicado:</strong> ${lead.servico}</p>
      <p><strong>Valor sugerido:</strong> ${lead.valor || "Não informado"}</p>
      <p><strong>Problemas:</strong> ${lead.problemas || "Não informado"}</p>
      <p><strong>Observações:</strong> ${lead.observacoes || "Sem observações"}</p>
      <p><strong>Data:</strong> ${lead.data}</p>

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

Principais pontos observados:
${lead.problemas || "Presença digital com oportunidades de melhoria."}

Acredito que o serviço de ${lead.servico} pode ajudar vocês a melhorarem a apresentação online e aumentarem a confiança dos clientes.

Posso te mostrar essa análise gratuita?
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

function atualizarDashboard() {
  document.getElementById("totalLeads").textContent = leads.length;
  document.getElementById("leadsQuentes").textContent = leads.filter(l => l.potencial === "Quente").length;
  document.getElementById("leadsMedios").textContent = leads.filter(l => l.potencial === "Médio").length;
  document.getElementById("leadsFrios").textContent = leads.filter(l => l.potencial === "Frio").length;
}

filtroCidade.addEventListener("input", renderizarLeads);
filtroNicho.addEventListener("change", renderizarLeads);
filtroStatus.addEventListener("change", renderizarLeads);

renderizarLeads();
atualizarDashboard();
