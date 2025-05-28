using BrainEx.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace BrainEx.Controllers
{
    public class CalcBrainAgeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Resultados()
        {
            return View();
        }
        public IActionResult CalculoRapido()
        {
            ViewData["Contexto"] = "CalcBrainAge";
            return View("~/Views/Juegos/CalculoRapido.cshtml");
        }
        public IActionResult CompletaOperacion()
        {
            ViewData["Contexto"] = "CalcBrainAge";
            return View("~/Views/Juegos/CompletaOperacion.cshtml");
        }
        public IActionResult EncuentraPatron()
        {
            ViewData["Contexto"] = "CalcBrainAge";
            return View("~/Views/Juegos/EncuentraPatron.cshtml");
        }
        public IActionResult MemoryGame()
        {
            ViewData["Contexto"] = "CalcBrainAge";
            return View("~/Views/Juegos/MemoryGame.cshtml");
        }
        public IActionResult SigueSecuencia()
        {
            ViewData["Contexto"] = "CalcBrainAge";
            return View("~/Views/Juegos/SigueSecuencia.cshtml");
        }
        public IActionResult TorreHanoi()
        {
            ViewData["Contexto"] = "CalcBrainAge";
            return View("~/Views/Juegos/TorreHanoi.cshtml");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
