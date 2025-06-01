using System.Text.Json;

namespace BrainEx.Models.Request
{
    public class EdadCerebralRequest
    {
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public Juego1Data? Juego1 { get; set; }
        public Juego2Data? Juego2 { get; set; }
        public Juego3Data? Juego3 { get; set; }
        public Juego4Data? Juego4 { get; set; }
        public Juego5Data? Juego5 { get; set; }
        public Juego6Data? Juego6 { get; set; }
    }
    public class Juego1Data
    {
        public List<string> Operations { get; set; } = new();
        public List<int> AttemptsPerOp { get; set; } = new();
        public List<double> TimesPerOp { get; set; } = new();

        public static Juego1Data FromJson(JsonElement json)
        {
            return new Juego1Data
            {
                Operations = json.GetProperty("Operations").EnumerateArray().Select(x => x.GetString() ?? "").ToList(),
                AttemptsPerOp = json.GetProperty("AttemptsPerOp").EnumerateArray().Select(x => x.GetInt32()).ToList(),
                TimesPerOp = json.GetProperty("TimesPerOp").EnumerateArray().Select(x => x.GetDouble()).ToList()
            };
        }
    }


    public class Juego2Data
    {
        public List<int> AttemptsPerRound { get; set; } = new();
        public List<double> TimesPerRound { get; set; } = new();
        public List<int>? PerfectRounds { get; set; }
    }

    public class Juego3Data
    {
        public List<List<int>> Sequences { get; set; } = new();
        public List<int> ExpectedValues { get; set; } = new();
        public List<int> AttemptsPerSeq { get; set; } = new();
        public List<double> TimesPerSeq { get; set; } = new();
    }

    public class Juego4Data
    {
        public List<int> AttemptsPerRound { get; set; } = new();
        public List<double> TimesPerRound { get; set; } = new();
        public List<int>? PerfectRounds { get; set; }
    }

    public class Juego5Data
    {
        public List<string> Operations { get; set; } = new();
        public List<int> AttemptsPerOp { get; set; } = new();
        public List<double> TimesPerOp { get; set; } = new();
    }

    public class Juego6Data
    {
        public int TotalDisks { get; set; }
        public int MoveCount { get; set; }
        public double TimeElapsed { get; set; }
        public int OptimalMoves { get; set; }
        public double Efficiency { get; set; }
    }
}
