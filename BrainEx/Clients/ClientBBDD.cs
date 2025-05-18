using BrainEx.Models;
using BrainEx.Config;
using Dapper;
using MySql.Data.MySqlClient;
using System.Data;

namespace BrainEx.Clients
{
    public class ClientBBDD
    {
        private readonly string _connectionString;
        public ClientBBDD()
        {
            _connectionString = ConfigWeb.ConnectionString;
        }

        public async Task<IEnumerable<User>> GetUsuariosAsync()
        {
            IEnumerable<User> usuarios = Enumerable.Empty<User>();

            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync(); // Paso explícito para depurar apertura de conexión

                    string query = "SELECT id, name, email FROM Users LIMIT 10";

                    usuarios = await connection.QueryAsync<User>(query); // Paso separado para ver si falla aquí
                }
            }
            catch (MySqlException ex)
            {
                // Error específico de MySQL
                Console.WriteLine($"MySQL error: {ex.Message}");
                // Puedes usar un logger si lo deseas
            }
            catch (Exception ex)
            {
                // Otros errores (timeout, red, etc.)
                Console.WriteLine($"Error general: {ex.Message}");
            }

            return usuarios;
        }


    }
}
