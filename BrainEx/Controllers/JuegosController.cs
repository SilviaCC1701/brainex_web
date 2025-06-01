using BrainEx.Models;
using BrainEx.Models.Resultados;
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
			ViewData["Contexto"] = "Juegos";
			return View();
		}
		public IActionResult CompletaOperacion()
		{
			ViewData["Contexto"] = "Juegos";
			return View();
		}
		public IActionResult EncuentraPatron()
		{
			ViewData["Contexto"] = "Juegos";
			return View();
		}
		public IActionResult MemoryGame()
		{
			ViewData["Contexto"] = "Juegos";
			return View();
		}
		public IActionResult SigueSecuencia()
		{
			ViewData["Contexto"] = "Juegos";
			return View();
		}
		public IActionResult TorreHanoi()
		{
			ViewData["Contexto"] = "Juegos";
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
				"calculo_rapido" => "/api/Juegos/calculo-rapido",
				"completa_operacion" => "/api/Juegos/completa-operacion",
				"encuentra_patron" => "/api/Juegos/encuentra-patron",
				"sigue_secuencia" => "/api/Juegos/sigue-secuencia",
				"memory_game" => "/api/Juegos/memory-game",
				"torre_hanoi" => "/api/Juegos/torre-hanoi",
				_ => null
			};

			if (targetEndpoint == null)
				return BadRequest("Juego no reconocido");

			var response = await httpClient.PostAsync($"{proxyUrl}{targetEndpoint}", content);

			if (response.IsSuccessStatusCode)
				return Ok("Guardado correctamente");

			return StatusCode((int)response.StatusCode, "Error al enviar a la API");
		}

        [HttpPost]
        [Route("Juegos/ResultadosTemp")]
        public IActionResult GuardarResultadosTemporales([FromBody] JsonElement json)
        {
            try
            {
                var game = json.GetProperty("game").GetString();
                var dataRaw = json.GetProperty("data").GetRawText();

                if (string.IsNullOrWhiteSpace(game))
                {
                    return BadRequest("Tipo de juego no proporcionado.");
                }

                string claveSesion = game switch
                {
                    "calculo_rapido" => "ResultadosJuegos_CalculoRapido",
                    "completa_operacion" => "ResultadosJuegos_CompletaOperacion",
                    "encuentra_patron" => "ResultadosJuegos_EncuentraPatron",
                    "sigue_secuencia" => "ResultadosJuegos_SigueSecuencia",
                    "memory_game" => "ResultadosJuegos_MemoryGame",
                    "torre_hanoi" => "ResultadosJuegos_TorreHanoi",
                    _ => null
                };

                if (claveSesion == null)
                {
                    return BadRequest("Tipo de juego no reconocido.");
                }

                object resultado = game switch
                {
                    "calculo_rapido" => new ResultadoCalculoRapido(dataRaw),
                    "completa_operacion" => new ResultadoCompletaOperacion(dataRaw),
                    "encuentra_patron" => new ResultadoEncuentraPatron(dataRaw),
                    "sigue_secuencia" => new ResultadoSigueSecuencia(dataRaw),
                    "memory_game" => new ResultadoMemoryGame(dataRaw),
                    "torre_hanoi" => new ResultadoTorreHanoi(dataRaw),
                    _ => null
                };

                if (resultado == null)
                {
                    return StatusCode(500, "No se pudo generar el resultado del juego.");
                }

                var jsonFinal = JsonSerializer.Serialize(resultado);
                HttpContext.Session.SetString(claveSesion, jsonFinal);

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al guardar resultados temporales: {ex.Message}");
                return StatusCode(500, "Error interno al guardar resultados.");
            }
        }



        [HttpGet]
        [Route("Juegos/CalculoRapido/Resultados")]
        [Route("Juegos/CompletaOperacion/Resultados")]
        [Route("Juegos/EncuentraPatron/Resultados")]
        [Route("Juegos/SigueSecuencia/Resultados")]
        [Route("Juegos/MemoryGame/Resultados")]
        [Route("Juegos/TorreHanoi/Resultados")]
        public IActionResult Resultados()
        {
            try
            {
                var path = Request.Path.ToString().ToLower();

                string claveSesion = path switch
                {
                    var p when p.Contains("calculorapido") => "ResultadosJuegos_CalculoRapido",
                    var p when p.Contains("completaoperacion") => "ResultadosJuegos_CompletaOperacion",
                    var p when p.Contains("encuentrapatron") => "ResultadosJuegos_EncuentraPatron",
                    var p when p.Contains("siguesecuencia") => "ResultadosJuegos_SigueSecuencia",
                    var p when p.Contains("memorygame") => "ResultadosJuegos_MemoryGame",
                    var p when p.Contains("torrehanoi") => "ResultadosJuegos_TorreHanoi",
                    _ => null
                };

                if (claveSesion == null)
                {
                    return RedirectToAction("Index", "Home");
                }

                var json = HttpContext.Session.GetString(claveSesion);
                if (string.IsNullOrWhiteSpace(json))
                {
                    return RedirectToAction("Index", "Juegos");
                }

                object? resultado = path switch
                {
                    var p when p.Contains("calculorapido") => JsonSerializer.Deserialize<ResultadoCalculoRapido>(json),
                    var p when p.Contains("completaoperacion") => JsonSerializer.Deserialize<ResultadoCompletaOperacion>(json),
                    var p when p.Contains("encuentrapatron") => JsonSerializer.Deserialize<ResultadoEncuentraPatron>(json),
                    var p when p.Contains("siguesecuencia") => JsonSerializer.Deserialize<ResultadoSigueSecuencia>(json),
                    var p when p.Contains("memorygame") => JsonSerializer.Deserialize<ResultadoMemoryGame>(json),
                    var p when p.Contains("torrehanoi") => JsonSerializer.Deserialize<ResultadoTorreHanoi>(json),
                    _ => null
                };

                if (resultado == null)
                {
                    return RedirectToAction("Index", "Juegos");
                }

                return View(resultado);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al cargar resultados: {ex.Message}");
                return RedirectToAction("Index", "Juegos");
            }
        }


    }
}
 