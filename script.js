let leads = JSON.parse(localStorage.getItem("flowdataLeads")) || [];

const form = document.getElementById("leadForm");
const listaLeads = document.getElementById("listaLeads");

const filtroCidade = document.getElementById("filtroCidade");
const filtroNicho = document.getElementById("filtroNicho");
const filtroStatus = document.getElementById("filtroStatus");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const lead = {
    id: Date.now(),
    empresa: document.getElementById("empresa").value,
    cidade: document.getElementById("cidade").value,
    nicho: document.getElementById("nicho").value,
    telefone: document.getElementById("telefone").value,
    site: document.getElementById("site").value,
    instagram: document.getElementById("instagram").value,
    googleMaps: document.getElementById("googleMaps").value,
    status: document.getElementById("status").value,
    observacoes: document.getElementById("observacoes").value,
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

function calcularNotaDigital(lead) {
  let nota = 0;

  if (lead.site) nota += 3;
  if (lead.instagram) nota += 2;
  if (lead.telefone) nota += 2;
  if (lead.googleMaps) nota += 2;
  if (lead.observacoes.length > 10) nota += 1;

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

  const leadsFiltrados = leads.filter(lead => {
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

  leadsFiltrados.forEach(lead => {
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
      <p><strong>Data:</strong> ${lead.data}</p>
      <p><strong>Observações:</strong> ${lead.observacoes || "Sem observações"}</p>

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

Analisei rapidamente a presença digital da ${lead.empresa} e percebi algumas oportunidades de melhoria que podem ajudar vocês a receberem mais contatos pelo WhatsApp.

Posso te mostrar uma análise gratuita e objetiva?
  `;

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

function alterarStatus(id) {
  const lead = leads.find(item => item.id === id);

  const novoStatus = prompt(
    "Digite o novo status: Novo, Contatado, Respondeu, Proposta enviada, Fechado ou Perdido",
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
    leads = leads.filter(lead => lead.id !== id);
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
