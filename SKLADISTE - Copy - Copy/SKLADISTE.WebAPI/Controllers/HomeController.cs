﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Skladiste.Model;
using Microsoft.EntityFrameworkCore;


//using Skladiste.Model;
using SKLADISTE.DAL.DataModel;
using SKLADISTE.Service.Common;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;



namespace SKLADISTE.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class HomeController : ControllerBase
    {
        private readonly SkladisteKresonjaDbContext _context;

        private readonly IService _service;

        public HomeController(IService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("username/{userId}")]
        public async Task<IActionResult> GetUserDetails(string userId)
        {
            var (userName, firstName, lastName) = await _service.GetUserDetailsAsync(userId);

            if (userName == null)
            {
                return NotFound();
            }

            // Return the result as JSON
            return Ok(new
            {
                UserName = userName,
                FirstName = firstName,
                LastName = lastName
            });
        }

        [HttpGet("usernames")]
        public async Task<IActionResult> GetAllUserIdsAndUsernames()
        {
            var users = await _service.GetAllUserIdsAndUsernamesAsync();
            return Ok(users);
        }
        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                await _service.DeleteUserByIdAsync(id);
                return Ok(new { Message = "User deleted successfully." });
            }
            catch (Exception ex)
            {
                // Log the exception details here
                return StatusCode(500, new { Message = "An error occurred while deleting the user.", Error = ex.Message });
            }
        }

        [HttpPut("update-user/{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserRequest request)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required.");
            }

            var success = await _service.UpdateUserAsync(userId, request.FirstName, request.LastName,request.UserName);

            if (success)
            {
                return Ok(new { message = "User updated successfully." });
            }

            return NotFound("User not found.");
        }

        [HttpGet("artikli_db")]
          public IActionResult GetAllArtiklsDB()
          {
              try
              {
                  IEnumerable<object> artiklDb = _service.GetAllArtiklsDb();
                  return Ok(artiklDb);
              }
              catch (Exception ex)
              {
                  return StatusCode(500, "Internal server error");
              }
          }

        [HttpGet("joined_artikls_db")]
        public IActionResult GetJoinedArtiklsData()
        {
            try
            {
                var joinedArtiklsData = _service.GetJoinedArtiklsData();
                return Ok(joinedArtiklsData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpGet("joined_artikls_db_date_order")]
        public IActionResult GetJoinedDataDateOrder()
        {
            try
            {
                var joinedArtiklsData = _service.GetJoinedDataDateOrder();
                return Ok(joinedArtiklsData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("FIFO_list/{artiklId}")]
        public IActionResult GetFIFOlist(int artiklId)
        {
            try
            {
                var joinedArtiklsData = _service.GetFIFOlist(artiklId);
                return Ok(joinedArtiklsData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpGet("ModalGraphInfo/{artiklId}")]
        public IActionResult GetModalGraphInfo(int artiklId)
        {
            try
            {
                var joinedArtiklsData = _service.GetModalGraphInfo(artiklId);
                return Ok(joinedArtiklsData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpPost("UpdateTrenutnaKolicina")]
        public async Task<IActionResult> UpdateTrenutnaKolicina()
        {
            // Read JSON data from the request body asynchronously
            using (var reader = new StreamReader(Request.Body))
            {
                var requestBody = await reader.ReadToEndAsync();
                dynamic data = JsonConvert.DeserializeObject(requestBody);

                // Extract values from the JSON
                int artiklId = data?.ArtiklId;
                int dokumentId = data?.DokumentId;
                int newKolicina = data?.NewKolicina;

                if (artiklId <= 0 || dokumentId <= 0 || newKolicina < 0)
                {
                    return BadRequest("Invalid request data.");
                }

                try
                {
                    bool success = await _service.UpdateTrenutnaKolicinaAsync(artiklId, dokumentId, newKolicina);

                    if (success)
                    {
                        return Ok("Trenutna količina je uspješno ažurirana.");
                    }
                    else
                    {
                        return NotFound("Artikl s ovim ID-om i DokumentID-om nije pronađen.");
                    }
                }
                catch (Exception ex)
                {
                    return StatusCode(500, "Internal server error");
                }
            }
        }

        [HttpPut("update_artikl/{id}")]
        public async Task<IActionResult> UpdateArtikl(int id, [FromBody] ArtiklUpdateModel model)
        {
            if (model == null)
            {
                return BadRequest("Artikl data is null.");
            }

            try
            {
                var result = await _service.UpdateArtiklAsync(id, model.ArtiklNaziv, model.ArtiklJmj, model.KategorijaId);

                if (result)
                {
                    return Ok("Artikl updated successfully.");
                }
                else
                {
                    return NotFound("Artikl not found.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    [HttpGet("joined_dokument_tip")]
        public IActionResult GetJoinedDokumentTip()
        {
            try
            {
                var dokumenti = _service.GetJoinedDokumentTip();
                return Ok(dokumenti);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }
        //Dodavanje Artikla
        [HttpPost("add_artikl")]
        public async Task<IActionResult> AddArtikl([FromBody] Artikl artikl)
        {
            if (artikl == null)
            {
                return BadRequest("Artikl is null.");
            }

            try
            {
                bool result = await _service.AddArtiklAsync(artikl);
                if (result)
                {
                    return Ok("Artikl added successfully.");
                }
                else
                {
                    return StatusCode(500, "Internal server error while adding artikl.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        //Dodavanje novoga dokumenta(Nova primka ili izdatnica)  KORISTI SE I ZA NARUDZBENICE
        [HttpPost("add_dokument")]
        public async Task<IActionResult> AddDokument([FromBody] Dokument dokument)
        {
            if (dokument == null)
            {
                return BadRequest("Dokument je null.");
            }

            try
            {
                bool result = await _service.AddDokumentAsync(dokument);

                if (result)
                {
                    return Ok(new { dokumentId = dokument.DokumentId }); // ← VRAĆA PRAVI ID
                }
                else
                {
                    return StatusCode(500, "Greška prilikom dodavanja dokumenta.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Greška: " + ex.Message);
            }
        }

        [HttpPost("add_kategorija")]
        public async Task<IActionResult> AddKategorija([FromBody] Kategorija kat)
        {
            if (kat == null)
            {
                return BadRequest("Artikl is null.");
            }
            try
            {
                bool result = await _service.AddKategorijaAsync(kat);
                if (result)
                {
                    return Ok("Artikl added successfully.");
                }
                else
                {
                    return StatusCode(500, "Internal server error while adding artikl.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }


        //DODAVANJE ARTIKALADOKUMENTA
        [HttpPost("add_artDok")]
        public async Task<IActionResult> AddArtDok([FromBody] ArtikliDokumenata artDok)
        {
            if (artDok == null)
            {
                return BadRequest("Artikl is null.");
            }
            try
            {
                bool result = await _service.AddArtiklDokumenta(artDok);
                if (result)
                {
                    return Ok("Artikl added successfully.");
                }
                else
                {
                    return StatusCode(500, "Internal server error while adding artikl.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("artikli_dokumenta")]
        public async Task<IActionResult> GetAllArtikliDokumenata()
        {
            var data = await _service.GetAllArtikliDokumenataAsync();
            return Ok(data);
        }

        [HttpGet("artikli_dokumenta/{id}")]
        public async Task<IActionResult> GetArtikliDokumentaById(int id)
        {
            var item = await _service.GetArtikliDokumentaByIdAsync(id);
            if (item == null)
                return NotFound();

            return Ok(item);
        }


        //vracanje svih kategorija
        [HttpGet("kategorije")]
        public IActionResult GetAllKategorijeDB()
        {
            try
            {
                IEnumerable<Kategorija> kategorija = _service.GetAllKategorijeS();
                return Ok(kategorija);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpDelete("delete_artikl/{id}")]
        public async Task<IActionResult> DeleteArtikl(int id)
        {
            var result = await _service.DeleteArtiklAsync(id);

            if (result)
            {
                return NoContent(); // 204 No Content on successful delete
            }

            return NotFound(); // 404 Not Found if Artikl doesn't exist
        }

        [HttpGet("joined_narudzbenice")]
        public IActionResult GetJoinedNarudzbenice()
        {
            try
            {
                var narudzbenice = _service.GetJoinedNarudzbenice();
                return Ok(narudzbenice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }


        [HttpGet("artikli_by_dokument/{dokumentId}")]
        public async Task<IActionResult> GetArtikliByDokumentId(int dokumentId)
        {
            var result = await _service.GetArtikliByDokumentIdAsync(dokumentId);
            return Ok(result);
        }

       
        [HttpPost("add_narudzbenica")]
        public async Task<IActionResult> AddNarudzbenica([FromBody] Dokument dokument)
        {
            if (dokument == null)
            {
                return BadRequest("Dokument je null.");
            }

            try
            {
                bool result = await _service.AddDokumentAsync(dokument);

                if (!result)
                    return StatusCode(500, "Greška prilikom dodavanja narudžbenice.");

                // ✅ Dodaj status samo za narudžbenice
                var status = new StatusDokumenta
                {
                    DokumentId = dokument.DokumentId,
                    StatusId = 1, // ← Zatvoren
                    Datum = DateTime.Now,
                    ZaposlenikId = dokument.ZaposlenikId, // uzmi iz istog dokumenta
              
                };


                await _service.AddStatusDokumentaAsync(status);

                return Ok(new { dokumentId = dokument.DokumentId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Greška: " + ex.Message);
            }
        }

        [HttpGet("dobavljaciDTO")]
        public async Task<IActionResult> GetDobavljaciDTO()
        {
            var dobavljaci = await _service.GetAllDobavljaciAsync();

            var dtoList = dobavljaci.Select(d => new DobavljacDTO
            {
                DobavljacId = d.DobavljacId,
                DobavljacNaziv = d.DobavljacNaziv,
                AdresaDobavljaca = d.AdresaDobavljaca,
                BrojTelefona = d.brojTelefona
            }).ToList();

            return Ok(dtoList);
        }
        [HttpGet("dobavljaciDTO/{id}")]
        public async Task<IActionResult> GetDobavljacDTOById(int id)
        {
            var dobavljac = await _service.GetDobavljacByIdAsync(id);

            if (dobavljac == null)
                return NotFound();

            var dto = new DobavljacDTO
            {
                DobavljacId = dobavljac.DobavljacId,
                DobavljacNaziv = dobavljac.DobavljacNaziv,
                AdresaDobavljaca = dobavljac.AdresaDobavljaca,
                BrojTelefona = dobavljac.brojTelefona
            };

            return Ok(dto);
        }
        [HttpGet("dobavljaci")]
        public async Task<IActionResult> GetAllDobavljaci()
        {
            try
            {
                var dobavljaci = await _service.GetAllDobavljaciAsync();
                return Ok(dobavljaci);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Greška: " + ex.Message);
            }
        }
        [HttpGet("dobavljaci/{id}")]
        public async Task<IActionResult> GetDobavljacById(int id)
        {
            try
            {
                var dobavljac = await _service.GetDobavljacByIdAsync(id);
                if (dobavljac == null)
                    return NotFound("Dobavljač nije pronađen.");

                return Ok(dobavljac);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Greška: " + ex.Message);
            }
        }
        [HttpPost("add_dobavljaci")]
        public async Task<IActionResult> AddDobavljac([FromBody] Dobavljac dobavljac)
        {
            if (dobavljac == null)
                return BadRequest("Dobavljač je null.");

            var result = await _service.AddDobavljacAsync(dobavljac);
            if (!result)
                return StatusCode(500, "Greška prilikom dodavanja dobavljača.");

            return Ok(dobavljac); // ili samo dobavljac.DobavljacId
        }

        [HttpPut("update_dobavljac/{id}")]
        public async Task<IActionResult> UpdateDobavljac(int id, [FromBody] Dobavljac updatedDobavljac)
        {
            if (id != updatedDobavljac.DobavljacId)
                return BadRequest("ID dobavljača se ne podudara.");

            var result = await _service.UpdateDobavljacAsync(updatedDobavljac);

            if (result)
                return Ok("Dobavljač uspješno ažuriran.");

            return NotFound("Dobavljač nije pronađen.");
        }


        [HttpDelete("delete_dobavljac/{id}")]
        public async Task<IActionResult> DeleteDobavljac(int id)
        {
            var result = await _service.DeleteDobavljacAsync(id);

            if (result)
                return Ok("Dobavljač je uspješno obrisan.");

            return NotFound("Dobavljač nije pronađen.");
        }

        [HttpGet("dokumenti_by_dobavljac/{dobavljacId}")]
        public async Task<IActionResult> GetDokumentiByDobavljacId(int dobavljacId)
        {
            var dokumenti = await _service.GetDokumentiByDobavljacIdAsync(dobavljacId);

            var dtoList = dokumenti.Select(d => new DokumentDto
            {
                DokumentId = d.DokumentId,
                OznakaDokumenta = d.OznakaDokumenta,
                DatumDokumenta = d.DatumDokumenta,
                Napomena = d.Napomena,
                TipDokumenta = d.TipDokumenta?.TipDokumenta,
                DobavljacId = d.DobavljacId
            });

            return Ok(dtoList);
        }

        [HttpDelete("obrisiDokument/{id}")]
        public async Task<IActionResult> ObrisiDokument(int id)
        {
            var uspjeh = await _service.ObrisiDokumentAsync(id);
            if (!uspjeh)
                return NotFound();

            return NoContent();
        }


        [HttpPost("narudzbenica_detalji")]
        public async Task<IActionResult> KreirajNarudzbenicaDetalje([FromBody] NarudzbenicaDetaljiCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest("Neispravni podaci.");

            var success = await _service.KreirajNarudzbenicaDetaljeAsync(dto);

            if (!success)
                return Conflict("NarudzbenicaDetalji već postoji za taj dokument.");

            return Ok("NarudzbenicaDetalji uspješno kreiran.");
        }
        [HttpGet("narudzbenica_detalji/{dokumentId}")]
        public async Task<IActionResult> GetNarudzbenicaDetalji(int dokumentId)
        {
            var detalji = await _service.DohvatiNarudzbenicaDetaljeAsync(dokumentId);

            if (detalji == null)
                return NotFound("Detalji narudžbenice nisu pronađeni.");

            return Ok(detalji);
        }
        [HttpGet("nacini_placanja")]
        public async Task<IActionResult> GetNaciniPlacanja()
        {
            var nacini = await _service.DohvatiSveNacinePlacanjaAsync();
            return Ok(nacini);
        }
        [HttpPost("dodaj_status_dokumenta")]
        public async Task<IActionResult> DodajStatusDokumenta([FromBody] StatusDokumenta status)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var uspjeh = await _service.DodajStatusDokumentaAsync(status);
            if (uspjeh)
                return Ok("Status dokumenta uspješno dodan.");
            else
                return StatusCode(500, "Došlo je do greške prilikom dodavanja statusa.");
        }
        [HttpPut("uredi_status_dokumenta")]
        public async Task<IActionResult> UrediStatus([FromBody] StatusDokumenta status)
        {
            var result = await _service.UrediStatusAsync(status);
            if (!result)
                return NotFound("Status nije pronađen.");

            return Ok("Status uspješno ažuriran.");
        }
        [HttpGet("statusi_tipovi")]
        public IActionResult GetStatusTipovi()
        {
            var tipovi = _service.GetAllStatusTipovi();
            return Ok(tipovi);
        }
        [HttpGet("statusi_dokumenata")]
        public IActionResult GetStatusiDokumenata()
        {
            var statusi = _service.GetAllStatusiDokumenata();
            return Ok(statusi);
        }
        [HttpPost("statusi_dokumenata")]
        public async Task<IActionResult> AddStatusDokumenta([FromBody] StatusDokumentaCreateRequest request)
        {
            if (request == null)
                return BadRequest("Prazan zahtjev.");

            var newStatus = new StatusDokumenta
            {
                DokumentId = request.DokumentId,
                StatusId = request.StatusId,
                Datum = request.Datum
            };

            var result = await _service.AddStatusDokumentaAsync(newStatus);

            if (result)
                return Ok("Status dodan.");
            else
                return StatusCode(500, "Greška prilikom dodavanja statusa.");
        }
        [HttpGet("statusi_dokumenata_by_dokument/{dokumentId}")]
        public IActionResult GetStatusiDokumentaByDokumentId(int dokumentId)
        {
            try
            {
                var statusi = _service.GetStatusiDokumentaByDokumentId(dokumentId);
                return Ok(statusi);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Greška: " + ex.Message);
            }
        }

        [HttpGet("dokument_status_parovi")]
        public async Task<ActionResult<List<DokumentStatusDto>>> GetDokumentStatusParovi()
        {
            var result = await _service.GetDokumentStatusPairsAsync();
            if (result == null || result.Count == 0)
            {
                return NotFound("Nema pronađenih statusa.");
            }

            return Ok(result);
        }
        [HttpPost("kreiraj_primnaru")]
        public async Task<IActionResult> KreirajPrimNaru([FromBody] PrimNaruVeze dto)
        {
            try
            {
                await _service.KreirajVezuAsync(dto.PrimkaId, dto.NarudzbenicaId);
                return Ok("Veza uspješno spremljena.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška: {ex.Message}");
            }
        }
        [HttpGet("primka_info/{id}")]
        public async Task<IActionResult> GetPrimkaInfo(int id)
        {
            var info = await _service.GetPrimkaInfoByIdAsync(id);
            if (info == null)
                return NotFound("Primka nije pronađena.");
            return Ok(info);
        }
        [HttpGet("artikli_info_po_primci/{primkaId}")]
        public async Task<IActionResult> GetArtikliInfoByPrimkaId(int primkaId)
        {
            var result = await _service.GetArtikliInfoByPrimkaId(primkaId);
            return Ok(result);
        }


    }



    public class ArtiklUpdateModel
    {
        public string ArtiklNaziv { get; set; }
        public string ArtiklJmj { get; set; }
        public int KategorijaId { get; set; }
    }
    public class UpdateUserRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
    }

}
