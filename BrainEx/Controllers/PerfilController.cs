using BrainEx.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

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

        public IActionResult Detalles()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
