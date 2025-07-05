import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Table, Button, Card, Container } from 'react-bootstrap';

function Pocetna() {
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userDetails, setUserDetails] = useState({ username: '', roles: [] });
    const [narudzbenice, setNarudzbenice] = useState([]);
    const [artikliMalo, setArtikliMalo] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('Username');
        const roles = JSON.parse(sessionStorage.getItem('Role') || '[]');

        if (token) {
            setIsAuthenticated(true);
            setUserDetails({ username, roles });
        }
    }, []);

    useEffect(() => {
        const token = sessionStorage.getItem('token');

        const fetchNarudzbenice = async () => {
            try {
                const res = await axios.get('https://localhost:5001/api/home/joined_narudzbenice', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const narData = res.data;

                const narWithStatus = await Promise.all(narData.map(async n => {
                    try {
                        const resp = await axios.get(`https://localhost:5001/api/home/statusi_dokumenata_by_dokument/${n.dokumentId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const statuses = resp.data;
                        const aktivni = statuses.find(s => s.aktivan === true || s.aktivan === 1 || s.Aktivan === true || s.Aktivan === 1);
                        const latest = statuses[statuses.length - 1];
                        const naziv = aktivni?.statusNaziv || aktivni?.StatusNaziv || latest?.statusNaziv || latest?.StatusNaziv || 'Nepoznat';
                        return { ...n, statusNaziv: naziv };
                    } catch (err) {
                        console.error('Greška pri dohvaćanju statusa:', err);
                        return { ...n, statusNaziv: 'Nepoznat' };
                    }
                }));

                setNarudzbenice(narWithStatus.filter(n => n.statusNaziv && n.statusNaziv.toLowerCase() === 'isporuka'));
            } catch (err) {
                console.error(err);
                alert('Greška prilikom učitavanja narudžbenica');
            }
        };

        const fetchArtikli = async () => {
            try {
                const [artikliRes, joinedRes] = await Promise.all([
                    axios.get('https://localhost:5001/api/home/artikli_db', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('https://localhost:5001/api/home/joined_artikls_db', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const artikliData = artikliRes.data;
                const joined = joinedRes.data;

                const artiklKolicine = joined.reduce((acc, curr) => {
                    if (!acc[curr.artiklId]) {
                        acc[curr.artiklId] = { ulaz: 0, izlaz: 0 };
                    }
                    if (curr.tipDokumenta === 'Primka') {
                        acc[curr.artiklId].ulaz += curr.kolicina;
                    } else if (curr.tipDokumenta === 'Izdatnica') {
                        acc[curr.artiklId].izlaz += curr.kolicina;
                    }
                    return acc;
                }, {});

                const enriched = artikliData.map(a => ({
                    ...a,
                    stanje: (artiklKolicine[a.artiklId]?.ulaz || 0) - (artiklKolicine[a.artiklId]?.izlaz || 0)
                }));

                setArtikliMalo(enriched.filter(a => a.stanje <= 20));
            } catch (err) {
                console.error(err);
                alert('Greška prilikom učitavanja artikala');
            }
        };

        if (token) {
            fetchNarudzbenice();
            fetchArtikli();
        }
    }, []);

    return (
        <Container className="mt-5">
            {isAuthenticated && userDetails.roles && (
                <>
                    <h1 className="text-light">Dobrodošli: {userDetails.username}</h1>

                    {/* Narudžbenice u isporuci */}
                    <Card className="form-card">
                        <Card.Header className="text-light" as="h4">Narudžbenice u isporuci</Card.Header>
                        <Card.Body>
                            <Table striped bordered hover variant="light">
                                <thead>
                                    <tr>
                                        <th>Oznaka</th>
                                        <th>Datum stvaranja</th>
                                        <th>Info</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {narudzbenice.map((n, idx) => (
                                        <tr key={idx}>
                                            <td>{n.oznakaDokumenta}</td>
                                            <td>{new Date(n.datumDokumenta).toLocaleDateString('hr-HR')}</td>
                                            <td>
                                                <Button variant="info" size="sm" onClick={() => navigate(`/narudzbenica/${n.dokumentId}`)}>
                                                    Detalji
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    {/* Artikli s malom količinom */}
                    <Card className="form-card">
                        <Card.Header className="text-light" as="h4">Artikli sa malom količinom</Card.Header>
                        <Card.Body>
                            <Table striped bordered hover variant="light">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Naziv artikla</th>
                                        <th>JMJ</th>
                                        <th>Količina</th>
                                        <th>Info</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {artikliMalo.map((a, idx) => (
                                        <tr key={idx}>
                                            <td>{a.artiklId}</td>
                                            <td>{a.artiklNaziv}</td>
                                            <td>{a.artiklJmj}</td>
                                            <td>{a.stanje}</td>
                                            <td>
                                                <Button variant="info" size="sm" onClick={() => navigate(`/artikl/${a.artiklId}`)}>
                                                    Prikaz
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </>
            )}
        </Container>
    );
}

export default Pocetna;
