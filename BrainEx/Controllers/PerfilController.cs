using BrainEx.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System;
using BrainEx.Models.Resultados;

namespace BrainEx.Controllers
{
    public class PerfilController : Controller
    {
        public async Task<IActionResult> Index()
        {
            if (!User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }

            var guid = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(guid)) { return RedirectToAction("Index", "Home"); }

            
            var proxyUrl = Environment.GetEnvironmentVariable("ApiBaseUrl");
            var targetEndpoint = $"/api/Usuarios/info-user/{guid}";
            var partidasEndpoint = $"/api/Usuarios/partidas/{guid}";

            using var httpClient = new HttpClient();
            var userResponse = httpClient.GetAsync($"{proxyUrl}{targetEndpoint}");
            var partidasJson = httpClient.GetStringAsync($"{proxyUrl}{partidasEndpoint}");
            await Task.WhenAll(userResponse, partidasJson);

            if (!userResponse.IsCompletedSuccessfully || !partidasJson.IsCompletedSuccessfully)
            {
                return RedirectToAction("Index", "Home");
            }

            var userJson = await userResponse.Result.Content.ReadAsStringAsync();
            
            var user = JsonSerializer.Deserialize<User>(userJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var partidas = JsonSerializer.Deserialize<List<PartidaItem>>(partidasJson.Result, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            //Comprobar de que vengan datos o redirigir a la home
            var model = new UsuarioDatosPerfil
            {
                Usuario = user,
                Partidas = partidas ?? new List<PartidaItem>()
            };
            return View(model);
        }

        public async Task<IActionResult> Detalles(string PartidaID)
        {
            if (string.IsNullOrEmpty(PartidaID)) { return View("Index", "Perfil"); }
            if (!User.Identity.IsAuthenticated) { return RedirectToAction("Index", "Home"); }

            var guid = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(guid)) { return RedirectToAction("Index", "Home"); }

            var proxyUrl = Environment.GetEnvironmentVariable("ApiBaseUrl");
            var targetEndpoint = $"/api/Usuarios/partida/{guid}/{PartidaID}";

            using var httpClient = new HttpClient();
            var partidaResponse = httpClient.GetAsync($"{proxyUrl}{targetEndpoint}");
            
            var detallesPartidaJson = await partidaResponse.Result.Content.ReadAsStringAsync();

            //if (!partidaResponse.IsCompletedSuccessfully)
            //{
            //    return RedirectToAction("Index", "Perfil");
            //}
            var underscoreIndex = PartidaID.IndexOf('_'); 
            var tipoPartida = PartidaID.Substring(underscoreIndex + 1);

            object? resultadoModelo = null;
            switch (tipoPartida)
            {
                case "calculo_rapido":
                    resultadoModelo = JsonSerializer.Deserialize<ResultadoCalculoRapido>(detallesPartidaJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    break;
                case "completa_operacion":
                    resultadoModelo = JsonSerializer.Deserialize<ResultadoCompletaOperacion>(detallesPartidaJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    break;
                case "encuentra_patron":
                    resultadoModelo = JsonSerializer.Deserialize<ResultadoEncuentraPatron>(detallesPartidaJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    break;
                case "memory_game":
                    resultadoModelo = JsonSerializer.Deserialize<ResultadoMemoryGame>(detallesPartidaJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    break;
                case "sigue_secuencia":
                    resultadoModelo = JsonSerializer.Deserialize<ResultadoSigueSecuencia>(detallesPartidaJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    break;
                case "torre_hanoi":
                    resultadoModelo = JsonSerializer.Deserialize<ResultadoTorreHanoi>(detallesPartidaJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    break;
                case "CEC":
                    //resultadoModelo = JsonSerializer.Deserialize<ResultadoCEC>(detallesPartidaJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    break;
            }

            if (resultadoModelo != null) { return View(resultadoModelo); }

            return RedirectToAction("Index", "Perfil");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
