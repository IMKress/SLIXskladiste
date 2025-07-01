import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { Card } from 'react-bootstrap';

function DokumentInfo() {
    const { id } = useParams();
    const [dokument, setDokument] = useState(null);
    const [artikli, setArtikli] = useState([]);
    const [username, setUsername] = useState('');
    const [oznakaNarudzbenice, setOznakaNarudzbenice] = useState('');
    const [narucenaKolicinaMap, setNarucenaKolicinaMap] = useState({});

    useEffect(() => {
        // Dohvati dokument (primku)
        axios.get(`https://localhost:5001/api/home/primka_info/${id}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        }).then(res => {
            setDokument(res.data);

            // Dohvati korisnicko ime zaposlenika
            if (res.data.zaposlenikId) {
                axios.get(`https://localhost:5001/api/home/username/${res.data.zaposlenikId}`, {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
                }).then(resp => setUsername(resp.data.userName))
                  .catch(() => setUsername('Nepoznato'));
            }

            // Dohvati oznaku narudzbenice
            axios.get(`https://localhost:5001/api/home/joined_narudzbenice`, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            }).then(resp => {
                const nar = resp.data.find(n => n.dokumentId === res.data.narudzbenicaId);
                if (nar) setOznakaNarudzbenice(nar.oznakaDokumenta);
            });

            // Dohvati narucenu kolicinu
            axios.get(`https://localhost:5001/api/home/artikli_info_po_primci/${id}`, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            }).then(resp => {
                const map = {};
                resp.data.forEach(entry => {
                    map[entry.artiklId] = entry.kolicina;
                });
                setNarucenaKolicinaMap(map);
            });
        }).catch(() => alert("Greška pri učitavanju dokumenta."));

        // Dohvati artikle
        axios.get(`https://localhost:5001/api/home/joined_artikls_db`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        }).then(res => {
            const filtered = res.data.filter(a => a.dokumentId.toString() === id);
            setArtikli(filtered);
        }).catch(() => alert("Greška pri učitavanju artikala."));
    }, [id]);

    const ukupnaKolicina = artikli.reduce((acc, a) => acc + a.kolicina, 0);
    const ukupnaCijena = artikli.reduce((acc, a) => acc + a.ukupnaCijena, 0);
    const ukupnaTrenutnaCijena = artikli.reduce((acc, a) => acc + (a.trenutnaKolicina * a.cijena), 0);

    if (!dokument) return <p>Učitavanje...</p>;

    return (
        <div className="container mt-4">
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>Detalji dokumenta</Card.Title>
                    <p><strong>ID:</strong> {dokument.dokumentId}</p>
                    <p><strong>Oznaka:</strong> {dokument.oznakaDokumenta}</p>
                    <p><strong>Tip:</strong> {dokument.tipDokumenta}</p>
                    <p><strong>Datum:</strong> {new Date(dokument.datumDokumenta).toLocaleDateString('hr-HR')}</p>
                    <p><strong>Zaposlenik:</strong> {username}</p>
                    <p><strong>Narudžbenica:</strong> {oznakaNarudzbenice}</p>
                </Card.Body>
            </Card>

            <h5 className="mt-4">Artikli:</h5>
            {artikli.length > 0 ? (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Artikl ID</th>
                            <th>Naziv</th>
                            <th>JMJ</th>
                            <th>Količina</th>
                            <th>Cijena (€)</th>
                            <th>Ukupno (€)</th>
                            <th>Naručena količina</th>
                            <th>Trenutna Količina</th>
                            <th>Trenutna Cijena (€)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {artikli.map((a, i) => (
                            <tr key={i}>
                                <td>{a.artiklId}</td>
                                <td>{a.artiklNaziv}</td>
                                <td>{a.artiklJmj}</td>
                                <td>{a.kolicina}</td>
                                <td>{a.cijena.toFixed(2)}</td>
                                <td>{a.ukupnaCijena.toFixed(2)}</td>
                                <td>{narucenaKolicinaMap[a.artiklId] || '-'}</td>
                                <td>{a.trenutnaKolicina}</td>
                                <td>{(a.trenutnaKolicina * a.cijena).toFixed(2)}</td>
                                <td></td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={6}><strong>Ukupno:</strong></td>
                            <td></td>
                            <td><strong>{ukupnaKolicina}</strong></td>
                            <td><strong>{ukupnaCijena.toFixed(2)} €</strong></td>
                            <td><strong>{ukupnaTrenutnaCijena.toFixed(2)} €</strong></td>
                        </tr>
                    </tbody>
                </Table>
            ) : (
                <p>Nema artikala za ovaj dokument.</p>
            )}
        </div>
    );
}

export default DokumentInfo;
