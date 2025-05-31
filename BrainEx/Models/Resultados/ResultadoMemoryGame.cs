using System.Text.Json;

namespace BrainEx.Models.Resultados
{
    public class ResultadoMemoryGame
    {
        public ResultadoMemoryGame() { }
        public double TiempoTotal { get; set; }
        public double TiempoMedio { get; set; }
        public int TotalFases { get; set; }
        public int SecuenciasPerfectas { get; set; }
        public double Precision { get; set; }
        public int FallosTotales { get; set; }
        public List<DetalleMemoryFase> Detalles { get; set; } = new();

        public ResultadoMemoryGame(string rawJson)
        {
            var json = JsonDocument.Parse(rawJson);
            var root = json.RootElement;

            var tiempos = root.GetProperty("timesPerRound").EnumerateArray().Select(tpRound => tpRound.GetDouble()).ToList();
            var intentos = root.GetProperty("attemptsPerRound").EnumerateArray().Select(apRound => apRound.GetInt32()).ToList();
            var perfectas = root.TryGetProperty("perfectRounds", out var pRound) ? pRound.EnumerateArray().Count() : 0;

            TotalFases = tiempos.Count;
            TiempoTotal = Math.Round(tiempos.Sum(), 2);
            TiempoMedio = Math.Round(tiempos.Average(), 2);
            FallosTotales = intentos.Sum();
            SecuenciasPerfectas = perfectas;
            Precision = Math.Round(100.0 * SecuenciasPerfectas / TotalFases, 1);

            for (int nroFase = 0; nroFase < TotalFases; nroFase++)
            {
                Detalles.Add(new DetalleMemoryFase
                {
                    Fase = nroFase + 1,
                    Fallos = intentos[nroFase],
                    Tiempo = Math.Round(tiempos[nroFase], 2)
                });
            }
        }
    }

    public class DetalleMemoryFase
    {
        public int Fase { get; set; }
        public int Fallos { get; set; }
        public double Tiempo { get; set; }
    }
}
