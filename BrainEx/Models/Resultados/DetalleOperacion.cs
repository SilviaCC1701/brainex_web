namespace BrainEx.Models.Resultados
{
    public class DetalleOperacion
    {
        public DetalleOperacion() { }
        public string Operacion { get; set; } = "";
        public int Intentos { get; set; }
        public double Tiempo { get; set; }
    }
}
