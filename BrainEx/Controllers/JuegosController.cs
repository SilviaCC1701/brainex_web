using BrainEx.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace BrainEx.Controllers
{
    public class JuegosController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult CalculoRapido()
        {
            return View();
        }
        public IActionResult CompletaOperacion()
        {
            return View();
        }
        public IActionResult EncuentraPatron()
        {
            return View();
        }
        public IActionResult MemoryGame()
        {
            return View();
        }
        public IActionResult SigueSecuencia()
        {
            return View();
        }
        public IActionResult TorreHanoi()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpPost]
        [Route("juegos/enviardatos")]
        public async Task<IActionResult> EnviarDatos([FromBody] JsonElement payload)
        {
            if (!User.Identity.IsAuthenticated)
                return Unauthorized("Usuario no autenticado");

            var guid = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(guid)) return BadRequest("No se encontró el GUID del usuario");

            if (!payload.TryGetProperty("game", out var gameProp) || !payload.TryGetProperty("data", out var dataProp))
                return BadRequest("Formato de datos inválido");

            var game = gameProp.GetString()?.ToLower();
            var data = dataProp.GetRawText();
            var requestPayload = new
            {
                guid,
                timestamp = DateTime.UtcNow,
                data = JsonSerializer.Deserialize<object>(data)
            };

            using var httpClient = new HttpClient();
            var json = JsonSerializer.Serialize(requestPayload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var proxyUrl = Environment.GetEnvironmentVariable("ApiBaseUrl");

            var targetEndpoint = game switch
            {
                "calculo-rapido" => "/api/Juegos/calculo-rapido",
                "completa-operacion" => "/api/Juegos/completa-operacion",
                "encuentra-patron" => "/api/Juegos/encuentra-patron",
                "sigue-secuencia" => "/api/Juegos/sigue-secuencia",
                "memory-game" => "/api/Juegos/memory-game",
                "torre-hanoi" => "/api/Juegos/torre-hanoi",
                _ => null
            };

            if (targetEndpoint == null)
                return BadRequest("Juego no reconocido");

            var response = await httpClient.PostAsync($"{proxyUrl}{targetEndpoint}", content);

            if (response.IsSuccessStatusCode)
                return Ok("Guardado correctamente");

            return StatusCode((int)response.StatusCode, "Error al enviar a la API");
        }

    }
}
 