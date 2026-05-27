const temperatura = document.getElementById("temperatura");
const umidade = document.getElementById("umidade");
const vibracao = document.getElementById("vibracao");
const statusVibracao = document.getElementById("statusVibracao");
const statusMaquina = document.getElementById("statusMaquina");
const statusBroker = document.getElementById("statusBroker");

const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

console.log("Conectando...");

client.on("connect", () => {
  console.log("Conectado.");
  statusBroker.textContent = "Online";
  statusBroker.style.color = "green";

  client.subscribe("gabriel/industria/status");
  client.subscribe("gabriel/industria/vibracao");
  client.subscribe("gabriel/industria/temperatura");
  client.subscribe("gabriel/industria/umidade");
});

client.on("message", (temp, message) => {});
