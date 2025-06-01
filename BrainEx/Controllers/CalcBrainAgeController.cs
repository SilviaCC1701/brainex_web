using BrainEx.Models;
using BrainEx.Models.Request;
using BrainEx.Models.Resultados;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace BrainEx.Controllers
{
    public class CalcBrainAgeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        //public async Task<IActionResult> Resultados()
        //{
        //    try
        //    {
        //        var json = HttpContext.Session.GetString("CalculoEdadCerebral");
        //        if (string.IsNullOrWhiteSpace(json))
        //            return RedirectToAction("Index", "CalcBrainAge");

        //        var datos = JsonSerializer.Deserialize<EdadCerebralRequest>(json);
        //        if (datos == null ||
        //            datos.FechaInicio == default || datos.FechaFin == null ||
        //            datos.Juego1 == null || datos.Juego2 == null ||
        //            datos.Juego3 == null || datos.Juego4 == null ||
        //            datos.Juego5 == null || datos.Juego6 == null)
        //        {
        //            return RedirectToAction("Index", "CalcBrainAge");
        //        }

        //        var jsonRequest = JsonSerializer.Serialize(datos, new JsonSerializerOptions { WriteIndented = true });

        //        Console.WriteLine("🔍 JSON para enviar a /api/EdadCerebral/calcular:");
        //        Console.WriteLine(jsonRequest);

        //        var baseUrl = Environment.GetEnvironmentVariable("ApiBaseUrl");
        //        if (string.IsNullOrEmpty(baseUrl))
        //            return StatusCode(500, "No se ha definido la URL base de la API");

        //        using var httpClient = new HttpClient();
        //        var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

        //        var response = await httpClient.PostAsync($"{baseUrl}/api/EdadCerebral/calcular", content);
        //        if (!response.IsSuccessStatusCode)
        //            return StatusCode((int)response.StatusCode, "Error al enviar datos a la API de edad cerebral");

        //        var responseContent = await response.Content.ReadAsStringAsync();

        //        var options = new JsonSerializerOptions
        //        {
        //            PropertyNameCaseInsensitive = true
        //        };
        //        var resultado = JsonSerializer.Deserialize<EdadCerebralResultado>(responseContent, options);

        //        return View(resultado);
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Error al procesar resultados completos: {ex.Message}");
        //        return RedirectToAction("Index", "CalcBrainAge");
        //    }
        //}

        public async Task<IActionResult> Resultados()
        {
            try
            {

                var jsonSimulado = @"{
  ""edadEstimada"": 24,
  ""puntuacionGlobal"": 75,
  ""tiempoTotalSegundos"": 116.2,
  ""resumenPorJuego"": [
    {
      ""juego"": ""Cálculo rápido"",
      ""categoria"": ""Atención / Agilidad numérica"",
      ""tiempoMedio"": 1.23,
      ""desviacionTiempo"": 0.4,
      ""aciertosPrimera"": 5,
      ""total"": 5,
      ""errores"": 0,
      ""precision"": 100,
      ""tiempoPorError"": 0,
      ""eficiencia"": 100
    },
    {
      ""juego"": ""Sigue la secuencia"",
      ""categoria"": ""Memoria visual"",
      ""tiempoMedio"": 1.81,
      ""desviacionTiempo"": 0.49,
      ""aciertosPrimera"": 0,
      ""total"": 5,
      ""errores"": -5,
      ""precision"": 0,
      ""tiempoPorError"": -9.04,
      ""eficiencia"": 100
    },
    {
      ""juego"": ""Encuentra el patrón"",
      ""categoria"": ""Lógica / Secuencial"",
      ""tiempoMedio"": 3.96,
      ""desviacionTiempo"": 4.15,
      ""aciertosPrimera"": 5,
      ""total"": 5,
      ""errores"": 0,
      ""precision"": 100,
      ""tiempoPorError"": 0,
      ""eficiencia"": 100
    },
    {
      ""juego"": ""Memoria de color"",
      ""categoria"": ""Memoria de trabajo"",
      ""tiempoMedio"": 0.78,
      ""desviacionTiempo"": 0.66,
      ""aciertosPrimera"": 1,
      ""total"": 5,
      ""errores"": -4,
      ""precision"": 20,
      ""tiempoPorError"": -3.13,
      ""eficiencia"": 100
    },
    {
      ""juego"": ""Completa la operación"",
      ""categoria"": ""Razonamiento numérico"",
      ""tiempoMedio"": 2.67,
      ""desviacionTiempo"": 2.03,
      ""aciertosPrimera"": 3,
      ""total"": 5,
      ""errores"": 4,
      ""precision"": 60,
      ""tiempoPorError"": 10.66,
      ""eficiencia"": 55.6
    },
    {
      ""juego"": ""Torre de Hanoi"",
      ""categoria"": ""Lógica / Planificación"",
      ""tiempoMedio"": 64.01,
      ""desviacionTiempo"": 0,
      ""aciertosPrimera"": 1,
      ""total"": 1,
      ""errores"": 0,
      ""precision"": 91.2,
      ""tiempoPorError"": 0,
      ""eficiencia"": 91.2
    }
  ],
  ""diagnostico"": ""Muy alto nivel de agilidad mental y concentración. Tus resultados reflejan claridad y eficacia en procesos cognitivos rápidos. Presentas una muy buena precisión y eficiencia general. Continúa con actividades que fomenten la atención sostenida y la toma de decisiones bajo presión.\n\nObservaciones destacadas: Sigue la secuencia: baja precisión, Encuentra el patrón: lentitud de respuesta, Memoria de color: baja precisión."",
  ""recomendaciones"": [
    ""Mejorar precisión en Sigue la secuencia realizando tareas similares"",
    ""Mejorar precisión en Memoria de color realizando tareas similares"",
    ""Mejorar precisión en Completa la operación realizando tareas similares"",
    ""Aumentar eficiencia en Completa la operación mediante repeticiones cronometradas"",
    ""Practica velocidad de respuesta en Torre de Hanoi con sesiones cortas""
  ],
  ""resultadoCalculoRapido"": {
    ""tiempoTotal"": 6.17,
    ""tiempoMedio"": 1.23,
    ""totalOperaciones"": 5,
    ""aciertosPrimera"": 5,
    ""precision"": 100,
    ""fallosTotales"": 0,
    ""intentosTotales"": 5,
    ""tiempoMinimo"": 0.9,
    ""tiempoMaximo"": 2,
    ""detallePorOperacion"": [
      {
        ""operacion"": ""4 + 8"",
        ""intentos"": 1,
        ""tiempo"": 2
      },
      {
        ""operacion"": ""8 + 1"",
        ""intentos"": 1,
        ""tiempo"": 1.22
      },
      {
        ""operacion"": ""9 - 7"",
        ""intentos"": 1,
        ""tiempo"": 1.08
      },
      {
        ""operacion"": ""1 + 10"",
        ""intentos"": 1,
        ""tiempo"": 0.9
      },
      {
        ""operacion"": ""6 + 3"",
        ""intentos"": 1,
        ""tiempo"": 0.96
      }
    ]
  },
  ""resultadoSigueSecuencia"": {
    ""tiempoTotal"": 9.04,
    ""tiempoMedio"": 1.81,
    ""totalFases"": 5,
    ""aciertosPrimera"": 5,
    ""precision"": 100,
    ""fallosTotales"": 0,
    ""intentosTotales"": 5,
    ""tiempoMinimo"": 1.09,
    ""tiempoMaximo"": 2.54,
    ""detalles"": [
      {
        ""fase"": 1,
        ""fallos"": 0,
        ""tiempo"": 1.71
      },
      {
        ""fase"": 2,
        ""fallos"": 0,
        ""tiempo"": 1.6
      },
      {
        ""fase"": 3,
        ""fallos"": 0,
        ""tiempo"": 2.54
      },
      {
        ""fase"": 4,
        ""fallos"": 0,
        ""tiempo"": 1.09
      },
      {
        ""fase"": 5,
        ""fallos"": 0,
        ""tiempo"": 2.1
      }
    ]
  },
  ""resultadoEncuentraPatron"": {
    ""tiempoTotal"": 19.79,
    ""tiempoMedio"": 3.96,
    ""totalSecuencias"": 5,
    ""aciertosPrimera"": 5,
    ""precision"": 100,
    ""fallosTotales"": 0,
    ""intentosTotales"": 5,
    ""tiempoMinimo"": 1.12,
    ""tiempoMaximo"": 12.04,
    ""detallePorSecuencia"": [
      {
        ""secuencia"": ""10 → 16 → 22 → 28"",
        ""intentos"": 1,
        ""tiempo"": 3.74
      },
      {
        ""secuencia"": ""3 → 12 → 21 → 30"",
        ""intentos"": 1,
        ""tiempo"": 12.04
      },
      {
        ""secuencia"": ""7 → 7 → 7 → 7"",
        ""intentos"": 1,
        ""tiempo"": 1.12
      },
      {
        ""secuencia"": ""7 → 8 → 9 → 10"",
        ""intentos"": 1,
        ""tiempo"": 1.16
      },
      {
        ""secuencia"": ""3 → 7 → 11 → 15"",
        ""intentos"": 1,
        ""tiempo"": 1.72
      }
    ]
  },
  ""resultadoMemoryGame"": {
    ""tiempoTotal"": 3.91,
    ""tiempoMedio"": 0.78,
    ""totalFases"": 5,
    ""secuenciasPerfectas"": 4,
    ""precision"": 80,
    ""fallosTotales"": 1,
    ""detalles"": [
      {
        ""fase"": 1,
        ""fallos"": 0,
        ""tiempo"": 0.08
      },
      {
        ""fase"": 2,
        ""fallos"": 0,
        ""tiempo"": 0.37
      },
      {
        ""fase"": 3,
        ""fallos"": 0,
        ""tiempo"": 0.59
      },
      {
        ""fase"": 4,
        ""fallos"": 0,
        ""tiempo"": 0.88
      },
      {
        ""fase"": 5,
        ""fallos"": 1,
        ""tiempo"": 1.99
      }
    ]
  },
  ""resultadoCompletaOperacion"": {
    ""tiempoTotal"": 13.33,
    ""tiempoMedio"": 2.67,
    ""totalOperaciones"": 5,
    ""aciertosPrimera"": 3,
    ""precision"": 60,
    ""fallosTotales"": 6,
    ""intentosTotales"": 9,
    ""tiempoMinimo"": 0.74,
    ""tiempoMaximo"": 6.6,
    ""detallePorOperacion"": [
      {
        ""operacion"": ""[?] - 2 = 1"",
        ""intentos"": 4,
        ""tiempo"": 6.6
      },
      {
        ""operacion"": ""[?] + 2 = 8"",
        ""intentos"": 1,
        ""tiempo"": 2.07
      },
      {
        ""operacion"": ""[?] + 2 = 8"",
        ""intentos"": 1,
        ""tiempo"": 0.74
      },
      {
        ""operacion"": ""[?] - 4 = 4"",
        ""intentos"": 2,
        ""tiempo"": 2.07
      },
      {
        ""operacion"": ""[?] + 6 = 6"",
        ""intentos"": 1,
        ""tiempo"": 1.85
      }
    ]
  },
  ""resultadoTorreHanoi"": {
    ""movimientos"": 34,
    ""tiempoTotal"": 64.01,
    ""discos"": 5,
    ""movimientosOptimos"": 31,
    ""eficiencia"": 91.2,
    ""movimientosExtra"": 3,
    ""tiempoPorMovimiento"": 1.88,
    ""eficienciaEsperada"": 91.2
  }
}";

                // DESERIALIZACIÓN FALSA EN MODO SIMULADO
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var resultado = JsonSerializer.Deserialize<EdadCerebralResultado>(jsonSimulado, options);
                return View(resultado);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al procesar resultados simulados: {ex.Message}");
                return RedirectToAction("Index", "CalcBrainAge");
            }
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

        [HttpPost]
        [Route("CalcBrainAge/GuardarResultadosCEC")]
        public IActionResult GuardarResultadosCEC([FromBody] JsonElement json)
        {
            try
            {
                string game = json.GetProperty("game").GetString() ?? "";
                var dataElement = json.GetProperty("data");
                string? fechaInicioStr = json.TryGetProperty("fechaInicio", out var fechaInicioJson)
                    ? fechaInicioJson.GetString()
                    : null;

                var sesionJson = HttpContext.Session.GetString("CalculoEdadCerebral");
                var datos = !string.IsNullOrWhiteSpace(sesionJson)
                    ? JsonSerializer.Deserialize<EdadCerebralRequest>(sesionJson) ?? new EdadCerebralRequest()
                    : new EdadCerebralRequest();

                if (datos.FechaInicio == default && DateTime.TryParse(fechaInicioStr, out var fechaInicio))
                {
                    datos.FechaInicio = fechaInicio;
                }

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                switch (game)
                {
                    case "calculo_rapido":
                        if (datos.Juego1 == null)
                            datos.Juego1 = JsonSerializer.Deserialize<Juego1Data>(dataElement.GetRawText(), options);
                        break;
                    case "sigue_secuencia":
                        if (datos.Juego2 == null)
                            datos.Juego2 = JsonSerializer.Deserialize<Juego2Data>(dataElement.GetRawText(), options);
                        break;
                    case "encuentra_patron":
                        if (datos.Juego3 == null)
                            datos.Juego3 = JsonSerializer.Deserialize<Juego3Data>(dataElement.GetRawText(), options);
                        break;
                    case "memory_game":
                        if (datos.Juego4 == null)
                            datos.Juego4 = JsonSerializer.Deserialize<Juego4Data>(dataElement.GetRawText(), options);
                        break;
                    case "completa_operacion":
                        if (datos.Juego5 == null)
                            datos.Juego5 = JsonSerializer.Deserialize<Juego5Data>(dataElement.GetRawText(), options);
                        break;
                    case "torre_hanoi":
                        if (datos.Juego6 == null)
                            datos.Juego6 = JsonSerializer.Deserialize<Juego6Data>(dataElement.GetRawText(), options);
                        break;
                    default:
                        return BadRequest("Tipo de juego no reconocido");
                }

                bool completos = datos.Juego1 != null && datos.Juego2 != null &&
                                 datos.Juego3 != null && datos.Juego4 != null &&
                                 datos.Juego5 != null && datos.Juego6 != null;

                if (completos && datos.FechaFin == null)
                {
                    datos.FechaFin = DateTime.UtcNow;
                }

                HttpContext.Session.SetString("CalculoEdadCerebral", JsonSerializer.Serialize(datos));

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al guardar resultados CEC: {ex.Message}");
                return StatusCode(500, "Error interno al procesar resultados.");
            }
        }


    }
}
