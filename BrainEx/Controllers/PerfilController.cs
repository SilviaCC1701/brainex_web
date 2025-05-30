using BrainEx.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using System.Text;

namespace BrainEx.Controllers
{
    public class PerfilController : Controller
    {
        public async Task<IActionResult> Index()
        {
            if (!User.Identity.IsAuthenticated) { return Unauthorized("Usuario no autenticado"); } // Redirigir a Home

            var guid = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(guid)) { return BadRequest("No se encontró el GUID del usuario"); }

            using var httpClient = new HttpClient();
            var proxyUrl = Environment.GetEnvironmentVariable("ApiBaseUrl");
            var targetEndpoint = $"/api/Usuarios/info-user/{guid}";

            if (targetEndpoint == null) return BadRequest("Valor no encontrado"); 

            var response = await httpClient.GetAsync($"{proxyUrl}{targetEndpoint}");

            User modelUser = new() {
                Name = "",
                UserName = "",
                Email = ""
            };

            return View(modelUser);
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
