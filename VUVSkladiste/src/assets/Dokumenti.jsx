import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Dokumenti() {
    const baseURL = "https://localhost:5001/api/home/joined_dokument_tip";
    const [artikli, setArtikli] = useState([]);
    const [filteredArtikli, setFilteredArtikli] = useState([]);
    const [filterType, setFilterType] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios({
            method: 'get',
            url: baseURL,
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        }).then(response => {
            setArtikli(response.data);
            setFilteredArtikli(response.data);
        }).catch(error => {
            console.error(error);
            alert("Greška prilikom učitavanja podataka");
        });
    }, []);

    useEffect(() => {
        let filtered = artikli;

        // ✅ Isključi Narudžbenice uvijek
        filtered = filtered.filter(art => art.tipDokumenta !== "Narudzbenica");

        if (filterType !== "all") {
            filtered = filtered.filter(art => art.tipDokumenta === filterType);
        }

        if (searchTerm) {
            filtered = filtered.filter(art =>
                art.dokumentId.toString().includes(searchTerm) ||
                art.tipDokumenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                new Date(art.datumDokumenta).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).includes(searchTerm)
            );
        }

        setFilteredArtikli(filtered);
    }, [filterType, searchTerm, artikli]);

    const handleInfoClick = (dokumentId) => {
        navigate(`/dokument-info/${dokumentId}`);
    };

    return (
        <>
            <div className="d-flex justify-content-center mt-4 gap-2">
                <Button
                    variant={filterType === "all" ? "dark" : "secondary"}
                    onClick={() => setFilterType("all")}
                >
                    Sve
                </Button>
                <Button
                    variant={filterType === "Primka" ? "dark" : "secondary"}
                    onClick={() => setFilterType("Primka")}
                >
                    Primke
                </Button>
                <Button
                    variant={filterType === "Izdatnica" ? "dark" : "secondary"}
                    onClick={() => setFilterType("Izdatnica")}
                >
                    Izdatnice
                </Button>
            </div>

            <Form.Group controlId="searchDokument" className="mt-3" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Form.Control
                    type="text"
                    placeholder="Pretraži po Šifri ili Nazivu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '80%' }}
                />
            </Form.Group>

            <Table className="centered-table mt-3" striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>Id dokumenta</th>
                        <th>Tip dokumenta</th>
                        <th>Datum dokumenta</th>
                        <th>Info</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        filteredArtikli.map((art, index) => (
                            <tr key={index}>
                                <td>{art.dokumentId}</td>
                                <td>{art.tipDokumenta}</td>
                                <td>{new Date(art.datumDokumenta).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}</td>
                                <td>
                                    <Button
                                        variant="info"
                                        onClick={() => handleInfoClick(art.dokumentId)}
                                        size="sm"
                                    >
                                        Detalji
                                    </Button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </>
    );
}

export default Dokumenti;
