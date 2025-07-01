import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Table, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AddArtiklModal, DatumArtikliModal } from './modals';
import { useNavigate } from 'react-router-dom';

function Primka() {
    const [artikli, setArtikli] = useState([]);
    const [jmjOptions, setJmjOptions] = useState([]);
    const [kategorijeOptions, setKategorijeOptions] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDatumArtikliModal, setShowDatumArtikliModal] = useState(false);
    const [selectedArtikl, setSelectedArtikl] = useState('');
    const [kolicina, setKolicina] = useState('');
    const [cijena, setCijena] = useState('');
    const [datumPrimke, setDatumPrimke] = useState(new Date());
    const [dodaniArtikli, setDodaniArtikli] = useState([]);
    const [ukupnaCijena, setUkupnaCijena] = useState(0);
    const [ukupniZbrojCijena, setUkupniZbrojCijena] = useState(0);
    const [dokumentId, setDokumentId] = useState('');

    const [narudzbenice, setNarudzbenice] = useState([]);
    const [selectedNarudzbenicaId, setSelectedNarudzbenicaId] = useState('');
    const [narudzbenaKolicina, setNarudzbenaKolicina] = useState('');
    const [dobavljacId, setDobavljacId] = useState('');

    const [userDetails, setUserDetails] = useState({ username: '', roles: [], UserId: "" });

    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('Username');
        const roles = JSON.parse(sessionStorage.getItem('Role') || '[]');
        const UserId = sessionStorage.getItem('UserId');
        if (token) {
            setUserDetails({ username, roles, UserId });
        }
    }, []);

    useEffect(() => {
    const fetchZatvoreneNarudzbenice = async () => {
        try {
            const [statusResponse, narudzbeniceResponse] = await Promise.all([
                axios.get("https://localhost:5001/api/home/dokument_status_parovi", {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
                }),
                axios.get("https://localhost:5001/api/home/joined_narudzbenice", {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
                })
            ]);

            const zatvoreniStatusi = statusResponse.data
                .filter(ds => ds.statusId === 2) // <- postavite točan status ID za 'zatvoreno'
                .map(ds => ds.dokumentId);

            const filtriraneNarudzbenice = narudzbeniceResponse.data.filter(n =>
                zatvoreniStatusi.includes(n.dokumentId)
            );

            setNarudzbenice(filtriraneNarudzbenice);
        } catch (err) {
            console.error("Greška pri dohvaćanju narudžbenica:", err);
            alert("Greška prilikom učitavanja zatvorenih narudžbenica.");
        }
    };

    fetchZatvoreneNarudzbenice();
}, []);

    const getLastDokId = async () => {
        const response = await axios.get('https://localhost:5001/api/home/joined_dokument_tip');
        const existingIds = response.data.map(item => item.dokumentId);
        return existingIds.length > 0 ? existingIds.slice(-1)[0] : 0;
    };

    useEffect(() => {
        const fetchLastId = async () => {
            const lastId = await getLastDokId();
            setDokumentId(lastId + 1);
        };

        fetchLastId();
    }, []);

    useEffect(() => {
        const fetchArtikliZaNarudzbenicu = async () => {
            if (!selectedNarudzbenicaId) {
                setArtikli([]);
                return;
            }

            try {
                const response = await axios.get("https://localhost:5001/api/home/joined_artikls_db", {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });

                const filtrirani = response.data.filter(
                    item => item.dokumentId === parseInt(selectedNarudzbenicaId)
                ).map(item => ({
                    artiklId: item.artiklId,
                    artiklNaziv: item.artiklNaziv,
                    artiklJmj: item.artiklJmj,
                    cijena: item.cijena,
                    kolicina: item.kolicina
                }));

                const uniqueArtikli = Array.from(new Map(
                    filtrirani.map(art => [art.artiklId, art])
                ).values());

                setArtikli(uniqueArtikli);
                setSelectedArtikl('');
                setCijena('');
                setNarudzbenaKolicina('');
            } catch (error) {
                console.error("Greška pri dohvaćanju artikala:", error);
                alert("Greška pri dohvaćanju artikala za narudžbenicu.");
            }
        };

        fetchArtikliZaNarudzbenicu();
    }, [selectedNarudzbenicaId]);

    useEffect(() => {
        if (selectedArtikl && selectedNarudzbenicaId) {
            const artikl = artikli.find(
                a => a.artiklId === parseInt(selectedArtikl)
            );
            if (artikl) {
                setCijena(artikl.cijena);
                setNarudzbenaKolicina(artikl.kolicina);
            }
        } else {
            setCijena('');
            setNarudzbenaKolicina('');
        }
    }, [selectedArtikl, selectedNarudzbenicaId, artikli]);

    useEffect(() => {
        const fetchKategorije = async () => {
            try {
                const response = await axios.get("https://localhost:5001/api/home/kategorije", {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });
                setKategorijeOptions(response.data);
            } catch (error) {
                console.error(error);
                alert("Greška prilikom učitavanja podataka");
            }
        };

        fetchKategorije();
    }, []);

    useEffect(() => {
        if (kolicina && cijena) {
            setUkupnaCijena(kolicina * cijena);
        } else {
            setUkupnaCijena(0);
        }
    }, [kolicina, cijena]);

    useEffect(() => {
        const zbrojCijena = dodaniArtikli.reduce((acc, artikl) => acc + artikl.ukupnaCijena, 0);
        setUkupniZbrojCijena(zbrojCijena);
    }, [dodaniArtikli]);

    useEffect(() => {
        if (selectedNarudzbenicaId) {
            const narudzbenica = narudzbenice.find(n => n.dokumentId === parseInt(selectedNarudzbenicaId));
            if (narudzbenica) {
                setDobavljacId(narudzbenica.dobavljacId);
            }
        }
    }, [selectedNarudzbenicaId, narudzbenice]);

    const handleAddArtikl = () => {
        if (selectedArtikl && kolicina && cijena) {
            const artikl = artikli.find(a => a.artiklId === parseInt(selectedArtikl));
            const noviArtikl = {
                redniBroj: dodaniArtikli.length + 1,
                artiklId: artikl.artiklId,
                artiklNaziv: artikl.artiklNaziv,
                kolicina: kolicina,
                cijena: cijena,
                ukupnaCijena: kolicina * cijena
            };

            setDodaniArtikli([...dodaniArtikli, noviArtikl]);
            resetForm();
        }
    };

    const handleRemoveArtikl = (redniBroj) => {
        const noviArtikli = dodaniArtikli.filter(artikl => artikl.redniBroj !== redniBroj)
            .map((artikl, index) => ({
                ...artikl,
                redniBroj: index + 1
            }));
        setDodaniArtikli(noviArtikli);
    };

    const resetForm = () => {
        setSelectedArtikl('');
        setKolicina('');
        setCijena('');
        setNarudzbenaKolicina('');
        setUkupnaCijena(0);
    };

    const resetFormAfterAdd = async () => {
        setSelectedArtikl('');
        setKolicina('');
        setDodaniArtikli([]);
        setCijena('');
        setNarudzbenaKolicina('');
        setUkupnaCijena(0);
        const lastId = await getLastDokId();
        setDokumentId(lastId + 1);
        setDatumPrimke(new Date());
    };

    return (
        <Container className="mt-5">
            <Card className="form-card">
                <Card.Body>
                    <div className="text-center mb-3">
                        <h3>PRIMKA: {dokumentId}</h3>
                    </div>
                    <h2 className="text-center">Kreiraj Primku</h2>
                    <Form>
                        <Form.Group controlId="narudzbenicaSelect">
                            <Form.Label>Odaberi Narudžbenicu</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedNarudzbenicaId}
                                onChange={(e) => setSelectedNarudzbenicaId(e.target.value)}
                            >
                                <option value="">-- Odaberi narudžbenicu --</option>
                                {narudzbenice.map((nar) => (
                                    <option key={nar.dokumentId} value={nar.dokumentId}>
                                        {nar.oznakaDokumenta}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="artiklSelect">
                            <Form.Label>Odaberi Artikl</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedArtikl}
                                onChange={(e) => setSelectedArtikl(e.target.value)}
                            >
                                <option value="">Odaberi...</option>
                                {artikli.map((artikl) => (
                                    <option key={artikl.artiklId} value={artikl.artiklId}>
                                        {artikl.artiklNaziv} ({artikl.artiklJmj})
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        {narudzbenaKolicina && (
                            <div className="mb-2">
                                <strong>Naručena količina:</strong> {narudzbenaKolicina}
                            </div>
                        )}

                        <Row className="mt-3">
                            <Col>
                                <Form.Group controlId="kolicinaInput">
                                    <Form.Label>Unesi Količinu</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Unesi količinu"
                                        value={kolicina}
                                        onChange={(e) => setKolicina(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="cijenaInput">
                                    <Form.Label>Cijena (iz narudžbenice)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={cijena}
                                        readOnly
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="ukupnaCijenaDisplay">
                                    <Form.Label>Ukupna Cijena</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={ukupnaCijena.toFixed(2)}
                                        readOnly
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between mt-3">
                            <Button variant="primary" onClick={handleAddArtikl}>
                                Dodaj Artikl
                            </Button>
                            <Button variant="secondary" onClick={resetForm}>
                                Odustani
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <div className="mt-3">
                <Button
                    variant="info"
                    onClick={() => {
                        navigate('/primkanova', {
                            state: {
                                dodaniArtikli,
                                datumPrimke,
                                dokumentId,
                                UserId: userDetails.UserId,
                                dobavljacId,
                                narudzbenicaId: parseInt(selectedNarudzbenicaId)

                            }
                        });
                    }}
                    disabled={dodaniArtikli.length === 0 || !dobavljacId}
                >
                    Pregledaj artikle i napravi primku
                </Button>
            </div>

            <h3 className="mt-4">Dodani Artikli</h3>
            <Table striped bordered hover variant="secondary">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Naziv Artikla</th>
                        <th>Količina</th>
                        <th>Cijena</th>
                        <th>Ukupna Cijena</th>
                        <th>/</th>
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
                            <td>
                                <Button variant="danger" onClick={() => handleRemoveArtikl(artikl.redniBroj)}>
                                    Obriši
                                </Button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="5" className="text-right"><strong>Ukupno:</strong></td>
                        <td><strong>{ukupniZbrojCijena.toFixed(2)} €</strong></td>
                        <td></td>
                    </tr>
                </tbody>
            </Table>

            <div className="total-price-footer">
                <h4>Ukupan Zbroj Cijena: {ukupniZbrojCijena.toFixed(2)} €</h4>
            </div>

            <AddArtiklModal
                show={showAddModal}
                handleClose={() => setShowAddModal(false)}
                handleSave={(newArtikl) => {
                    setDodaniArtikli([...dodaniArtikli, newArtikl]);
                    setShowAddModal(false);
                }}
                jmjOptions={jmjOptions}
                kategorijeOptions={kategorijeOptions}
            />

            <DatumArtikliModal
                show={showDatumArtikliModal}
                handleClose={() => setShowDatumArtikliModal(false)}
                dokumentId={dokumentId}
                datumPrimke={datumPrimke}
                setDatumPrimke={setDatumPrimke}
                dodaniArtikli={dodaniArtikli}
                resetForm={resetFormAfterAdd}
                UserId={userDetails.UserId}
            />
        </Container>
    );
}

export default Primka;
