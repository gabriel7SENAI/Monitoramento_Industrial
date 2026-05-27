function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// MQTT
const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

// ELEMENTOS
const statusBroker = document.getElementById("statusBroker");
const statusMaquina = document.getElementById("statusMaquina");
const vibracao = document.getElementById("vibracao");
const statusVibracao = document.getElementById("statusVibracao");
const temperatura = document.getElementById("temperatura");
const umidade = document.getElementById("umidade");
const btnEstado = document.getElementById("btnEstado");
const alerta = document.getElementById("alerta");

const cardTemp = document.querySelector(".card:nth-child(1)");
const cardUmidade = document.querySelector(".card:nth-child(2)");
const cardVibracao = document.querySelector(".card:nth-child(3)");
const cardMaquina = document.querySelector(".card:nth-child(4)");

const lastUpdate = document.getElementById("lastUpdate");

// ESTADO
let maquinaLigada = false;
let ultimoPacote = Date.now();

// ALERTA
function showAlert(msg) {
  alerta.textContent = msg;
  alerta.classList.remove("hidden");

  setTimeout(() => {
    alerta.classList.add("hidden");
  }, 4000);
}

// GRÁFICO
const ctx = document.getElementById("chartTemp");

const chartTemp = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Temperatura",
        data: [],
        borderWidth: 2,
      },
    ],
  },
});

// INIT LOG
console.log("Conectando front...");
btnEstado.disabled = true;
btnEstado.textContent = "Conectando...";

// CONEXÃO
client.on("connect", async () => {
  console.log("Conectado ao broker MQTT");
  console.log("Front conectado e recebendo dados em tempo real");

  statusBroker.textContent = "Online";
  statusBroker.className = "status online";

  client.subscribe("gabriel/industria/#");

  await delay(1000);

  btnEstado.disabled = false;
  btnEstado.textContent = "Ligar";
});

// OFFLINE
client.on("close", () => {
  console.log("Desconectado do broker MQTT");

  statusBroker.textContent = "Offline";
  statusBroker.className = "status offline";

  btnEstado.disabled = true;
  btnEstado.textContent = "Desconectado";

  showAlert("⚠ FALHA DE CONEXÃO MQTT");
});

// MENSAGENS
client.on("message", (topic, message) => {
  const msg = message.toString();
  ultimoPacote = Date.now();

  if (topic === "gabriel/industria/status") {
    statusMaquina.textContent = msg;
    maquinaLigada = msg === "ON";
    btnEstado.textContent = maquinaLigada ? "Desligar" : "Ligar";
    cardMaquina.className = maquinaLigada ? "card ok" : "card warning";
  }

  if (topic === "gabriel/industria/temperatura") {
    const val = parseFloat(msg);
    temperatura.textContent = msg;

    chartTemp.data.labels.push("");
    chartTemp.data.datasets[0].data.push(val);

    if (chartTemp.data.datasets[0].data.length > 20) {
      chartTemp.data.datasets[0].data.shift();
      chartTemp.data.labels.shift();
    }

    chartTemp.update();

    if (val > 40) {
      cardTemp.className = "card danger";
      showAlert("⚠ SUPERAQUECIMENTO");
    } else {
      cardTemp.className = "card ok";
    }
  }

  if (topic === "gabriel/industria/umidade") {
    umidade.textContent = msg;
  }

  if (topic === "gabriel/industria/vibracao/valor") {
    const v = Number(msg);
    vibracao.textContent = v;

    if (v <= 0) {
      statusVibracao.textContent = "PARADA";
    } else if (v > 7) {
      cardVibracao.className = "card danger";
      statusVibracao.textContent = "CRÍTICA";
      showAlert("⚠ VIBRAÇÃO EXCESSIVA");
    } else if (v > 3) {
      cardVibracao.className = "card warning";
      statusVibracao.textContent = "ALTA";
    } else {
      cardVibracao.className = "card ok";
      statusVibracao.textContent = "NORMAL";
    }
  }

  lastUpdate.textContent =
    "Última atualização: " + new Date().toLocaleTimeString();
});

// BOTÃO
btnEstado.addEventListener("click", async () => {
  const cmd = maquinaLigada ? "OFF" : "ON";

  console.log("Enviando comando:", cmd);

  btnEstado.textContent = maquinaLigada ? "Desligando..." : "Ligando...";

  await delay(1000);

  client.publish("gabriel/industria/comando", cmd);
});

// FALHA DE COMUNICAÇÃO
setInterval(() => {
  if (Date.now() - ultimoPacote > 10000) {
    console.log("Sem resposta do sistema (timeout)");
    showAlert("⚠ SISTEMA SEM RESPOSTA");
    statusBroker.textContent = "Offline";
    statusBroker.className = "status offline";
  }
}, 3000);
