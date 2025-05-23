using Microsoft.AspNetCore.Mvc;

namespace BrainEx.Controllers
{
    public class CalcBrainAgeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
