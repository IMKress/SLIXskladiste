using System;

namespace Skladiste.Model
{
    public class MostSoldProductDto
    {
        public int ArtiklId { get; set; }
        public string ArtiklNaziv { get; set; }
        public double TotalKolicina { get; set; }
    }
}
