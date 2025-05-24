using BrainEx.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BrainEx.Controllers
{
    public class CuentaController : Controller
    {
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] UsuarioLogin login)
        {
            using var httpClient = new HttpClient();
            string proxyUrl = Environment.GetEnvironmentVariable("ApiBaseUrl");
            var response = await httpClient.PostAsJsonAsync($"{proxyUrl}/api/usuarios/login", login);

            if (!response.IsSuccessStatusCode)
                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos" });

            // Extrae info del usuario desde la API
            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();

            // Crea la cookie de sesión
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, result.Usuario.Usuario),
                new Claim(ClaimTypes.Email, result.Usuario.Email)
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            return Ok();
        }

        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }
    }

    public class LoginResponse
    {
        public bool Exito { get; set; }
        public string Mensaje { get; set; }
        public UsuarioDTO Usuario { get; set; }
    }

    public class UsuarioDTO
    {
        public string Nombre { get; set; }
        public string Usuario { get; set; }
        public string Email { get; set; }
    }
}
