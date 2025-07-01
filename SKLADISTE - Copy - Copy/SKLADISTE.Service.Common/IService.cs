//using Skladiste.Model;
using Skladiste.Model;
using SKLADISTE.DAL.DataModel;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace SKLADISTE.Service.Common
{
    public interface IService
    {
        Task<(string UserName, string FirstName, string LastName)> GetUserDetailsAsync(string userId);
        Task DeleteUserByIdAsync(string userId);
        Task<List<(string Id, string Username)>> GetAllUserIdsAndUsernamesAsync();
        Task<bool> UpdateUserAsync(string userId, string firstName, string lastName, string userName);
        IEnumerable<object> GetAllArtiklsDb();
        IEnumerable<object> GetJoinedArtiklsData();
        IEnumerable<object> GetJoinedDataDateOrder();

        IEnumerable<object> GetJoinedDokumentTip();
        IEnumerable<object> GetFIFOlist(int artiklId);
        IEnumerable<object> GetModalGraphInfo(int artiklId);

        Task<bool> UpdateTrenutnaKolicinaAsync(int artiklId, int dokumentId, int newKolicina);
        Task<bool> UpdateArtiklAsync(int artiklId, string artiklNaziv, string artiklJmj, int kategorijaId);
        Task<bool> AddArtiklAsync(Artikl artikl);
        Task<bool> AddKategorijaAsync(Kategorija kat);

        Task<bool> AddDokumentAsync(Dokument dokument);
        Task<bool> AddArtiklDokumenta(ArtikliDokumenata artDok);

        IEnumerable<Kategorija> GetAllKategorijeS();

        Task<bool> DeleteArtiklAsync(int artiklId);

        IEnumerable<object> GetJoinedNarudzbenice();

        Task<IEnumerable<object>> GetArtikliByDokumentIdAsync(int dokumentId);
        IEnumerable<StatusTip> GetAllStatusTipovi();
        IEnumerable<StatusDokumenta> GetAllStatusiDokumenata();
        Task<bool> AddStatusDokumentaAsync(StatusDokumenta status);
        IEnumerable<object> GetStatusiDokumentaByDokumentId(int dokumentId);

        Task<List<Dobavljac>> GetAllDobavljaciAsync();
        Task<Dobavljac> GetDobavljacByIdAsync(int id);
        Task<bool> AddDobavljacAsync(Dobavljac dobavljac);
        Task<bool> UpdateDobavljacAsync(Dobavljac dobavljac);
        Task<bool> DeleteDobavljacAsync(int id);
        Task<IEnumerable<Dokument>> GetDokumentiByDobavljacIdAsync(int dobavljacId);


        Task<bool> ObrisiDokumentAsync(int dokumentId);

        Task<bool> KreirajNarudzbenicaDetaljeAsync(NarudzbenicaDetaljiCreateDto dto);
        Task<NarudzbenicaDetalji?> DohvatiNarudzbenicaDetaljeAsync(int dokumentId);
        Task<List<Nacin_Placanja>> DohvatiSveNacinePlacanjaAsync();
        Task<bool> DodajStatusDokumentaAsync(StatusDokumenta status);
        Task<bool> UrediStatusAsync(StatusDokumenta status);
        Task<List<DokumentStatusDto>> GetDokumentStatusPairsAsync();
        Task KreirajVezuAsync(int primkaId, int narudzbenicaId);
        Task<PrimkaInfoDto> GetPrimkaInfoByIdAsync(int primkaId);
        Task<List<PrimNaruArtiklDto>> GetArtikliInfoByPrimkaId(int primkaId);

    }
}
