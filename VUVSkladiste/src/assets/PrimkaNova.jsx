import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Table, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { generirajOznakuDokumenta } from './oznakaDokumenta';

function PrimkaNova() {
    const location = useLocation();
    const navigate = useNavigate();

    const { dodaniArtikli, datumPrimke, dokumentId, UserId, dobavljacId } = location.state || {};
    const { narudzbenicaId } = location.state || {};

    const formatDateForAPI = (date) => {
        const d = new Date(date);
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();
        return `${month.padStart(2, '0')}.${day.padStart(2, '0')}.${year}`;
    };
    const oznaka = generirajOznakuDokumenta();
    const ukupniZbrojCijena = dodaniArtikli?.reduce((acc, item) => acc + item.ukupnaCijena, 0) || 0;

    const handleCreatePrimka = async () => {
        const formattedDate = formatDateForAPI(datumPrimke);

        const dokumentBody = {
            DokumentId: 0,
            DatumDokumenta: formattedDate,
            TipDokumentaId: 1,
            ZaposlenikId: UserId,
            Napomena: "",
            DobavljacId: dobavljacId,
            OznakaDokumenta: oznaka,
            PrimateljId: 0
        };
        console.log('Dokument koji se šalje:', dokumentBody);
        try {

            const dokRes = await axios.post('https://localhost:5001/api/home/add_dokument', dokumentBody, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (dokRes.status !== 200) {
                alert('Greška pri spremanju dokumenta.');
                return;
            }

            for (const artikl of dodaniArtikli) {
                const artiklBody = {
                    id: 0,
                    DokumentId: dokumentId,
                    RbArtikla: artikl.redniBroj,
                    Kolicina: artikl.kolicina,
                    Cijena: artikl.cijena,
                    UkupnaCijena: artikl.ukupnaCijena,
                    ArtiklId: artikl.artiklId,
                    TrenutnaKolicina: artikl.kolicina,
                    ZaposlenikId: UserId,

                };

                const artRes = await axios.post('https://localhost:5001/api/home/add_artDok', artiklBody, {
                    headers: { 'Content-Type': 'application/json' }
                });

                if (artRes.status !== 200) {
                    alert('Greška pri spremanju artikla.');
                    return;
                }
            }

            const vezaBody = {
                narudzbenicaId: narudzbenicaId,
                primkaId: dokumentId
            };
            console.log(vezaBody)
            await axios.post('https://localhost:5001/api/home/kreiraj_primnaru', vezaBody, {
                headers: { 'Content-Type': 'application/json' }
            });

            alert('Primka uspješno kreirana!');
            navigate('/Dokumenti');
        } catch (error) {
            console.error('Greška:', error);
            alert('Došlo je do greške pri spremanju.');
        }
    };

    if (!dodaniArtikli || !datumPrimke || !UserId || !dokumentId) {
        return <Container className="mt-5"><h4>Podaci nisu ispravno preneseni.</h4></Container>;
    }

    return (
        <Container className="mt-5">
            <h2>Pregled nove primke</h2>
            <Form.Group className="mb-3">
                <Form.Label>Datum Primke</Form.Label>
                <Form.Control type="text" readOnly value={new Date(datumPrimke).toLocaleDateString('hr-HR')} />
            </Form.Group>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Artikl ID</th>
                        <th>Naziv Artikla</th>
                        <th>Količina</th>
                        <th>Cijena</th>
                        <th>Ukupna Cijena</th>
                    </tr>
                </thead>
                <tbody>
                    {dodaniArtikli.map((artikl, index) => (
                        <tr key={index}>
                            <td>{artikl.redniBroj}</td>
                            <td>{artikl.artiklId}</td>
                            <td>{artikl.artiklNaziv}</td>
                            <td>{artikl.kolicina}</td>
                            <td>{artikl.cijena}</td>
                            <td>{artikl.ukupnaCijena.toFixed(2)} €</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="5" className="text-end"><strong>Ukupno:</strong></td>
                        <td><strong>{ukupniZbrojCijena.toFixed(2)} €</strong></td>
                    </tr>
                </tbody>
            </Table>

            <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate(-1)}>Natrag</Button>
                <Button variant="primary" onClick={handleCreatePrimka}>Spremi Primku</Button>
            </div>
        </Container>
    );
}

export default PrimkaNova;
