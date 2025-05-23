using Microsoft.AspNetCore.Mvc;

namespace BrainEx.Controllers
{
    public class JuegosController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
