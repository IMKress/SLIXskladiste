using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SKLADISTE.Service.Common;

namespace SKLADISTE.WebAPI
{
    public class NarudzbenicaCleanupService : BackgroundService
    {
        private readonly IService _service;
        private readonly ILogger<NarudzbenicaCleanupService> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromHours(1);

        public NarudzbenicaCleanupService(IService service, ILogger<NarudzbenicaCleanupService> logger)
        {
            _service = service;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var removed = await _service.ObrisiStareOtvoreneNarudzbeniceAsync();
                    if (removed > 0)
                    {
                        _logger.LogInformation($"Automatski obrisano {removed} narudžbenica.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Greška prilikom automatskog brisanja narudžbenica");
                }

                await Task.Delay(_interval, stoppingToken);
            }
        }
    }
}
