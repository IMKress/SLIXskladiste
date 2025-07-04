import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Table, Button, Spinner, Modal } from 'react-bootstrap';

function NarudzbenicaDetalji() {
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [changingStatus, setChangingStatus] = useState(false);
    const [closingStatus, setClosingStatus] = useState(false);
    const [aktivniStatusId, setAktivniStatusId] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const [narudzbenica, setNarudzbenica] = useState(null);
    const [artikli, setArtikli] = useState([]);
    const [zaposlenikIme, setZaposlenikIme] = useState(null);
    const [statusDokumenta, setStatusDokumenta] = useState(null);
    const [detalji, setDetalji] = useState(null);
    const [nazivPlacanja, setNazivPlacanja] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`https://localhost:5001/api/home/obrisiDokument/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Dokument uspješno obrisan.");
            navigate("/narudzbenice");
        } catch (error) {
            console.error("Greška pri brisanju:", error);
            alert("Greška pri brisanju dokumenta.");
        } finally {
            setDeleting(false);
            setShowModal(false);
        }
    };

    const handlePromijeniStatus = async () => {
        const token = sessionStorage.getItem('token');
        const zaposlenikId = sessionStorage.getItem('UserId');

        if (!zaposlenikId) {
            alert("Korisnik nije prijavljen.");
            return;
        }

        setChangingStatus(true);
        try {
            const body = {
                dokumentId: parseInt(id),
                statusId: 3, //3=isporuka
                datum: new Date().toISOString(),
                zaposlenikId
            };

            const res = await axios.put(
                `https://localhost:5001/api/home/uredi_status_dokumenta`,
                body,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 200) {
                alert("Status uspješno promijenjen.");
                setStatusDokumenta("Isporuka");
                setAktivniStatusId(3);
            } else {
                alert("Greška pri promjeni statusa.");
            }
        } catch (err) {
            console.error(err);
            alert("Došlo je do greške.");
        } finally {
            setChangingStatus(false);
        }
    };

    const handleZatvoriNarudzbenicu = async () => {
        const token = sessionStorage.getItem('token');
        const zaposlenikId = sessionStorage.getItem('UserId');

        if (!zaposlenikId) {
            alert("Korisnik nije prijavljen.");
            return;
        }

        setClosingStatus(true);
        try {
            const body = {
                dokumentId: parseInt(id),
                statusId: 2, //2=zatvoren
                datum: new Date().toISOString(),
                zaposlenikId
            };

            const res = await axios.put(
                `https://localhost:5001/api/home/uredi_status_dokumenta`,
                body,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 200) {
                alert("Status uspješno promijenjen.");
                setStatusDokumenta("Zatvorena");
                setAktivniStatusId(2);
            } else {
                alert("Greška pri promjeni statusa.");
            }
        } catch (err) {
            console.error(err);
            alert("Došlo je do greške.");
        } finally {
            setClosingStatus(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token');

                const response = await axios.get(`https://localhost:5001/api/home/joined_narudzbenice`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const allNarudzbenice = response.data;

                const target = allNarudzbenice.find(d => d.dokumentId == id);
                if (!target) {
                    setNarudzbenica(null);
                    return;
                }
                setNarudzbenica(target);

                if (target.zaposlenikId) {
                    const userResponse = await axios.get(`https://localhost:5001/api/home/username/${target.zaposlenikId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const { firstName, lastName } = userResponse.data;
                    setZaposlenikIme(`${firstName} ${lastName}`);
                }

                const artResponse = await axios.get(`https://localhost:5001/api/home/artikli_by_dokument/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setArtikli(artResponse.data);

                const statusResponse = await axios.get(`https://localhost:5001/api/home/statusi_dokumenata_by_dokument/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statusResponse.data && statusResponse.data.length > 0) {
                    const aktivni = statusResponse.data.find(s => s.aktivan === true);
                    const latest = statusResponse.data[statusResponse.data.length - 1];
                    const naziv = aktivni?.statusNaziv || latest.statusNaziv;
                    const idStatusa = aktivni?.statusId || latest.statusId;
                    setStatusDokumenta(naziv);
                    setAktivniStatusId(idStatusa);
                }

                const detaljiResponse = await axios.get(`https://localhost:5001/api/home/narudzbenica_detalji/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setDetalji(detaljiResponse.data);

                if (detaljiResponse.data?.nP_Id) {
                    const npResponse = await axios.get(`https://localhost:5001/api/home/nacini_placanja`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const nacin = npResponse.data.find(n => n.nP_Id === detaljiResponse.data.nP_Id);
                    if (nacin) setNazivPlacanja(nacin.nP_Naziv);
                }

            } catch (err) {
                alert('Greška prilikom dohvaćanja podataka.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    }

    if (!narudzbenica) {
        return <div className="text-center mt-5">Narudžbenica nije pronađena. (ID: {id})</div>;
    }

    return (
        <Container className="mt-4">
            <Card>
                <Card.Body>
                    <h3>Pregled Narudžbenice #{narudzbenica.oznakaDokumenta}</h3>
                    <p><strong>Datum:</strong> {new Date(narudzbenica.datumDokumenta).toLocaleDateString('hr-HR')}</p>
                    <p><strong>Zaposlenik:</strong> {zaposlenikIme}</p>
                    <p><strong>Tip dokumenta:</strong> {narudzbenica.tipDokumenta}</p>
                    <p><strong>Status:</strong> {statusDokumenta || "Nepoznat"}</p>

                    {detalji && (
                        <>
                            <p><strong>Mjesto isporuke:</strong> {detalji.mjestoIsporuke}</p>
                            <p><strong>Rok isporuke:</strong> {new Date(detalji.rokIsporuke).toLocaleDateString('hr-HR')}</p>
                            <p><strong>Način plaćanja:</strong> {nazivPlacanja || `ID: ${detalji.nP_Id}`}</p>
                        </>
                    )}

                    <h5 className="mt-4">Stavke</h5>
                    {artikli.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Artikl ID</th>
                                    <th>Naziv</th>
                                    <th>Jmj</th>
                                    <th>Količina</th>
                                    <th>Cijena</th>
                                    <th>Ukupna cijena</th>
                                </tr>
                            </thead>
                            <tbody>
                                {artikli.map((a, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{a.artiklId}</td>
                                        <td>{a.artiklNaziv}</td>
                                        <td>{a.artiklJmj}</td>
                                        <td>{a.kolicina}</td>
                                        <td>{a.cijena}</td>
                                        <td>{a.ukupnaCijena}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p>Ova narudžbenica nema artikala.</p>
                    )}

                    <Button variant="danger" className="ms-2" onClick={() => setShowModal(true)}>
                        Obriši narudžbenicu
                    </Button>

                    {aktivniStatusId !== 3 && aktivniStatusId !== 2 && (
                        <Button
                            variant="warning"
                            onClick={handlePromijeniStatus}
                            disabled={changingStatus}
                            className="me-2"
                        >
                            {changingStatus ? 'Šaljem...' : 'Isporuka'}
                        </Button>
                    )}

                    {aktivniStatusId !== 2 && (
                        <Button
                            variant="success"
                            onClick={handleZatvoriNarudzbenicu}
                            disabled={closingStatus}
                            className="me-2"
                        >
                            {closingStatus ? 'Zatvaram...' : 'Zatvori narudžbenicu'}
                        </Button>
                    )}

                    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Potvrda brisanja</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Jeste li sigurni da želite obrisati ovu narudžbenicu? Ova radnja je nepovratna i obrisat će i povezane primke.
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Odustani
                            </Button>
                            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                                {deleting ? "Brišem..." : "Obriši"}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Button variant="secondary" onClick={() => navigate(-1)}>Natrag</Button>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default NarudzbenicaDetalji;
