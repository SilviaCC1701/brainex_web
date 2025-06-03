namespace BrainEx.Models
{
    public class UsuarioDatosPerfil
    {
        public User Usuario { get; set; }
        public List<PartidaItem> Partidas { get; set; } = new();
        public string EdadCerebral {  get; set; }
    }
}
