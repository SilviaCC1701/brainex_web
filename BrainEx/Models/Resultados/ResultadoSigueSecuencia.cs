using System.Text.Json;

namespace BrainEx.Models.Resultados
{
    public class ResultadoSigueSecuencia
    {
        public ResultadoSigueSecuencia() { }
        public double TiempoTotal { get; set; }
        public double TiempoMedio { get; set; }
        public int TotalFases { get; set; }
        public int AciertosPrimera { get; set; }
        public double Precision { get; set; }
        public int FallosTotales { get; set; }
        public int IntentosTotales { get; set; }
        public double TiempoMinimo { get; set; }
        public double TiempoMaximo { get; set; }
        public List<DetalleSigueSecuenciaFase> Detalles { get; set; } = new();

        public ResultadoSigueSecuencia(string rawJson)
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
            IntentosTotales = FallosTotales + TotalFases;
            AciertosPrimera = perfectas;
            Precision = Math.Round(100.0 * AciertosPrimera / TotalFases, 1);
            TiempoMinimo = Math.Round(tiempos.Min(), 2);
            TiempoMaximo = Math.Round(tiempos.Max(), 2);

            for (int nroFase = 0; nroFase < TotalFases; nroFase++)
            {
                Detalles.Add(new DetalleSigueSecuenciaFase
                {
                    Fase = nroFase + 1,
                    Fallos = intentos[nroFase],
                    Tiempo = Math.Round(tiempos[nroFase], 2)
                });
            }
        }
    }

    public class DetalleSigueSecuenciaFase
    {
        public int Fase { get; set; }
        public int Fallos { get; set; }
        public double Tiempo { get; set; }
    }
}
