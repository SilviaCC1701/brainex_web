using BrainEx.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

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
    }
}
 