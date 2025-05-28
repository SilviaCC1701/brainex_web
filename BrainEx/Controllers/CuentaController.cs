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
            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, result.Usuario.Usuario),
                new Claim(ClaimTypes.Email, result.Usuario.Email),
                new Claim(ClaimTypes.NameIdentifier, result.Usuario.Guid.ToString())
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            return Ok();
        }
        [HttpPost]
        public async Task<IActionResult> Registro([FromBody] UsuarioRegistro usuario)
        {
            using var httpClient = new HttpClient();
            string proxyUrl = Environment.GetEnvironmentVariable("ApiBaseUrl");
            var response = await httpClient.PostAsJsonAsync($"{proxyUrl}/api/usuarios/registro", usuario);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
                return BadRequest(error);
            }
            var login = new UsuarioLogin
            {
                Usuario = usuario.Usuario,
                Contrasena = usuario.Contrasena
            };

            return await Login(login);
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
        public Guid Guid { get; set; }
        public string Usuario { get; set; }
        public string Email { get; set; }
    }
}
