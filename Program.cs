using System.Text;
using MQTTnet;

Console.Clear();

var factory = new MqttClientFactory();
var client = factory.CreateMqttClient();

bool maquinaLigada = false;

var options = new MqttClientOptionsBuilder()
    .WithTcpServer("broker.hivemq.com")
    .Build();


client.ApplicationMessageReceivedAsync += e =>
{
    string msg = Encoding.UTF8.GetString(
        e.ApplicationMessage.Payload
    );

    if (msg == "ON")
    {
        maquinaLigada = true;
    }
    else if (msg == "OFF")
    {
        maquinaLigada = false;
    }

    return Task.CompletedTask;
};


Console.WriteLine("Conectando back...");
client.ConnectedAsync += async e =>
{
    Console.WriteLine("Reconectado / Conectado");

    await client.SubscribeAsync("gabriel/industria/comando");
};
await client.ConnectAsync(options);
Console.WriteLine("Conectado!");


client.DisconnectedAsync += async e =>
  {
      Console.WriteLine("Desconectado");

      await Task.Delay(3000);

      Console.WriteLine("Reconectando...");

      try
      {
          await client.ConnectAsync(options);
          Console.WriteLine("Reconectado!");
      }
      catch
      {
          Console.WriteLine("Falha ao reconectar.");
      }
  };

Random random = new Random();
while (true)
{
    double temperatura = random.NextDouble() * (45 - 35) + 35;

    double umidade = random.NextDouble() * (80 - 40) + 40;

    double vibracao = random.NextDouble() * 10;

    string statusMaquina = maquinaLigada ? "ON" : "OFF";

    if (!maquinaLigada)
    {
        temperatura -= 5;
        umidade -= 3;
        vibracao = 0;
    }

    var statusMsg = new MqttApplicationMessageBuilder()
        .WithTopic("gabriel/industria/status")
        .WithPayload($"{statusMaquina}")
        .Build();

    var vibracaoMsg = new MqttApplicationMessageBuilder()
        .WithTopic("gabriel/industria/vibracao/valor")
        .WithPayload($"{vibracao:F0}")
        .Build();

    var temperaturaMsg = new MqttApplicationMessageBuilder()
        .WithTopic("gabriel/industria/temperatura")
        .WithPayload($"{temperatura:F2}°C")
        .Build();

    var umidadeMsg = new MqttApplicationMessageBuilder()
        .WithTopic("gabriel/industria/umidade")
        .WithPayload($"{umidade:F0}%")
        .Build();


    await client.PublishAsync(statusMsg);
    await Task.Delay(50);

    await client.PublishAsync(vibracaoMsg);
    await Task.Delay(50);

    await client.PublishAsync(temperaturaMsg);
    await Task.Delay(50);

    await client.PublishAsync(umidadeMsg);
    await Task.Delay(50);



    Console.WriteLine($@"Dados publicados:

Status da máquina: {statusMaquina}
Vibração: {vibracao:F0}
Temperatura: {temperatura:F2}°C
Umidade: {umidade:F0}%
");
    await Task.Delay(5000);
}
