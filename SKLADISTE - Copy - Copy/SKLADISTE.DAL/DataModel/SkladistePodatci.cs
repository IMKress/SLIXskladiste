using System.Collections.Generic;

namespace SKLADISTE.DAL.DataModel
{
    public class Skladiste
    {
        public int SkladisteId { get; set; }
        public string SkladisteNaziv { get; set; }
        public string AdresaSkladista { get; set; }
        public string brojTelefona { get; set; }
        public string Email { get; set; }
        public ICollection<Dokument> Dokumenti { get; set; }
    }
}
