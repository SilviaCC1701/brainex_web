namespace BrainEx.Models
{
    public class PartidaItem
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public string Tipo { get; set; } = "";
        public double Segundos { get; set; }
    }
}
