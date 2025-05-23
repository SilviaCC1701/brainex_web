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

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
