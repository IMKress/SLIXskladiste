import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Table, Button, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function NarudzbenicaDetalji() {
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [changingStatus, setChangingStatus] = useState(false);
    const [closingStatus, setClosingStatus] = useState(false);
    const [aktivniStatusId, setAktivniStatusId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [allArtikli, setAllArtikli] = useState([]);
    const [selectedArtikl, setSelectedArtikl] = useState('');
    const [kolicinaArtikla, setKolicinaArtikla] = useState('');
    const [cijenaArtikla, setCijenaArtikla] = useState('');
    const [ukupnoArtikla, setUkupnoArtikla] = useState(0);
    const [addingArtikl, setAddingArtikl] = useState(false);
    const [editingArtiklId, setEditingArtiklId] = useState(null);
    const [editKolicina, setEditKolicina] = useState('');
    const [editCijena, setEditCijena] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    const [narudzbenica, setNarudzbenica] = useState(null);
    const [artikli, setArtikli] = useState([]);
    const [zaposlenikIme, setZaposlenikIme] = useState(null);
    const [statusDokumenta, setStatusDokumenta] = useState(null);
    const [detalji, setDetalji] = useState(null);
    const [nazivPlacanja, setNazivPlacanja] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleDownloadPDF = () => {
        const element = document.getElementById('narudzbenica-pdf');
        if (!element) return;
        html2canvas(element).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position -= pageHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`narudzbenica_${narudzbenica?.oznakaDokumenta || id}.pdf`);
        });
    };

    useEffect(() => {
        const fetchAllArtikli = async () => {
            try {
                const res = await axios.get('https://localhost:5001/api/home/artikli_db', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                setAllArtikli(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAllArtikli();
    }, []);

    useEffect(() => {
        if (kolicinaArtikla && cijenaArtikla) {
            setUkupnoArtikla(parseFloat(kolicinaArtikla) * parseFloat(cijenaArtikla));
        } else {
            setUkupnoArtikla(0);
        }
    }, [kolicinaArtikla, cijenaArtikla]);

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

    const handleDodajArtikl = async () => {
        if (!selectedArtikl || !kolicinaArtikla || !cijenaArtikla) {
            alert('Popunite sva polja.');
            return;
        }
        if (artikli.some(a => a.artiklId === parseInt(selectedArtikl))) {
            alert('Artikl je već dodan.');
            return;
        }
        setAddingArtikl(true);
        const token = sessionStorage.getItem('token');
        const zaposlenikId = sessionStorage.getItem('UserId');
        try {
            const body = {
                id: 0,
                DokumentId: parseInt(id),
                RbArtikla: artikli.length + 1,
                Kolicina: parseFloat(kolicinaArtikla),
                Cijena: parseFloat(cijenaArtikla),
                UkupnaCijena: parseFloat(kolicinaArtikla) * parseFloat(cijenaArtikla),
                ArtiklId: parseInt(selectedArtikl),
                TrenutnaKolicina: 0,
                ZaposlenikId: zaposlenikId
            };

            const res = await axios.post('https://localhost:5001/api/home/add_artDok', body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 200) {
                const artResponse = await axios.get(`https://localhost:5001/api/home/artikli_by_dokument/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setArtikli(artResponse.data);
                setSelectedArtikl('');
                setKolicinaArtikla('');
                setCijenaArtikla('');
                setShowAddForm(false);
            } else {
                alert('Greška pri dodavanju artikla.');
            }
        } catch (err) {

            if (err.response && err.response.status === 409) {
                alert('Artikl je već dodan.');
            } else {
                console.error(err);
                alert('Došlo je do greške.');
            }
        } finally {
            setAddingArtikl(false);
        }
    };

    const handleEditClick = (a) => {
        setEditingArtiklId(a.artiklId);
        setEditKolicina(a.kolicina);
        setEditCijena(a.cijena);
    };

    const handleSaveEdit = async () => {
        if (!editKolicina || !editCijena) {
            alert('Popunite sva polja.');
            return;
        }
        setSavingEdit(true);
        const token = sessionStorage.getItem('token');
        try {
            const body = {
                DokumentId: parseInt(id),
                ArtiklId: editingArtiklId,
                Kolicina: parseFloat(editKolicina),
                Cijena: parseFloat(editCijena)
            };
            await axios.put('https://localhost:5001/api/home/update_artDok', body, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const artResponse = await axios.get(`https://localhost:5001/api/home/artikli_by_dokument/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArtikli(artResponse.data);
            setEditingArtiklId(null);
        } catch (err) {
            console.error(err);
            alert('Greška pri ažuriranju.');
        } finally {
            setSavingEdit(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingArtiklId(null);
        setEditKolicina('');
        setEditCijena('');
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
                    const aktivni = statusResponse.data.find(
                        s => s.aktivan === true || s.aktivan === 1 || s.Aktivan === true || s.Aktivan === 1
                    );
                    const latest = statusResponse.data[statusResponse.data.length - 1];
                    const naziv = aktivni?.statusNaziv || aktivni?.StatusNaziv || latest.statusNaziv || latest.StatusNaziv;
                    const idStatusa = aktivni?.statusId || aktivni?.StatusId || latest.statusId || latest.StatusId;
                    setStatusDokumenta(naziv);
                    setAktivniStatusId(parseInt(idStatusa, 10));
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
            <Card id="narudzbenica-pdf">
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
                                    {aktivniStatusId === 1 && <th></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {artikli.map((a, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{a.artiklId}</td>
                                        <td>{a.artiklNaziv}</td>
                                        <td>{a.artiklJmj}</td>
                                        <td>
                                            {editingArtiklId === a.artiklId ? (
                                                <Form.Control type="number" value={editKolicina} onChange={e => setEditKolicina(e.target.value)} />
                                            ) : (
                                                a.kolicina
                                            )}
                                        </td>
                                        <td>
                                            {editingArtiklId === a.artiklId ? (
                                                <Form.Control type="number" value={editCijena} onChange={e => setEditCijena(e.target.value)} />
                                            ) : (
                                                a.cijena
                                            )}
                                        </td>
                                        <td>{editingArtiklId === a.artiklId ? (parseFloat(editKolicina || 0) * parseFloat(editCijena || 0)).toFixed(2) : a.ukupnaCijena}</td>
                                        {aktivniStatusId === 1 && (
                                            <td>
                                                {editingArtiklId === a.artiklId ? (
                                                    <>
                                                        <Button variant="success" size="sm" className="me-1" onClick={handleSaveEdit} disabled={savingEdit}>
                                                            {savingEdit ? 'Spremam...' : 'Spremi'}
                                                        </Button>
                                                        <Button variant="secondary" size="sm" onClick={handleCancelEdit}>Odustani</Button>
                                                    </>
                                                ) : (
                                                    <Button variant="outline-primary" size="sm" onClick={() => handleEditClick(a)}>Uredi</Button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p>Ova narudžbenica nema artikala.</p>
                    )}

                    {aktivniStatusId === 1 && !showAddForm && (
                        <Button variant="primary" className="mt-2" onClick={() => setShowAddForm(true)}>
                            Dodaj Artikl
                        </Button>
                    )}

                    {aktivniStatusId === 1 && showAddForm && (
                        <div className="mt-3">
                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Artikl</Form.Label>
                                        <Form.Control as="select" value={selectedArtikl} onChange={(e) => setSelectedArtikl(e.target.value)}>
                                            <option value="">-- Odaberi --</option>
                                            {allArtikli
                                                .filter(a => !artikli.some(exists => exists.artiklId === a.artiklId))
                                                .map(a => (
                                                    <option key={a.artiklId} value={a.artiklId}>
                                                        {a.artiklNaziv} ({a.artiklJmj})
                                                    </option>
                                                ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Količina</Form.Label>
                                        <Form.Control type="number" value={kolicinaArtikla} onChange={(e) => setKolicinaArtikla(e.target.value)} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Cijena</Form.Label>
                                        <Form.Control type="number" value={cijenaArtikla} onChange={(e) => setCijenaArtikla(e.target.value)} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Ukupno</Form.Label>
                                        <Form.Control type="text" value={ukupnoArtikla.toFixed(2)} readOnly />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="mt-2">
                                <Button variant="success" onClick={handleDodajArtikl} disabled={addingArtikl} className="me-2">
                                    {addingArtikl ? 'Spremam...' : 'Spremi'}
                                </Button>
                                <Button variant="secondary" onClick={() => { setShowAddForm(false); setSelectedArtikl(''); setKolicinaArtikla(''); setCijenaArtikla(''); }}>
                                    Odustani
                                </Button>
                            </div>
                        </div>
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

                    <Button variant="info" className="me-2" onClick={handleDownloadPDF}>
                        Spremi kao PDF
                    </Button>

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
