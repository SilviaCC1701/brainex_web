using System.Diagnostics;
using BrainEx.Clients;
using BrainEx.Models;
using Microsoft.AspNetCore.Mvc;

namespace BrainEx.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ClientBBDD _client;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
            _client = new ClientBBDD();

        }

        public async Task<IActionResult> Index()
        {
            var usuarios = await _client.GetUsuariosAsync();
            return View(usuarios); // pasa la lista a la vista
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult Login()
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
        public IActionResult SigueSecuencia()
        {
            return View();
        }
        public IActionResult MemoryGame()
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
    }
}
