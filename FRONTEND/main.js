const temperatura = document.getElementById("temperatura");
const umidade = document.getElementById("umidade");
const vibracao = document.getElementById("vibracao");
const statusVibracao = document.getElementById("statusVibracao");
const statusMaquina = document.getElementById("statusMaquina");
const statusBroker = document.getElementById("statusBroker");
const btnDesligar = document.getElementById("btnDesligar");

const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

console.log("Conectando front...");

client.on("connect", () => {
  console.log("Conectado.");
  statusBroker.textContent = "Online";
  statusBroker.style.color = "green";

  client.subscribe("gabriel/industria/status");
  client.subscribe("gabriel/industria/vibracao/valor");
  client.subscribe("gabriel/industria/vibracao/status");
  client.subscribe("gabriel/industria/temperatura");
  client.subscribe("gabriel/industria/umidade");
});

client.on("message", (topic, message) => {
  if (topic === "gabriel/industria/status") {
    statusMaquina.textContent = message.toString();
  }

  if (topic === "gabriel/industria/vibracao/valor") {
    vibracao.textContent = message.toString();
  }

  if (topic === "gabriel/industria/vibracao/status") {
    statusVibracao.textContent = message.toString();
  }

  if (topic === "gabriel/industria/temperatura") {
    temperatura.textContent = message.toString();
  }

  if (topic === "gabriel/industria/umidade") {
    umidade.textContent = message.toString();
  }
});

btnDesligar.addEventListener("click", () => {
  client.publish("gabriel/industria/comando"), "OFF";
});
