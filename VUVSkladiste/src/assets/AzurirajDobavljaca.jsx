import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button } from "react-bootstrap";

function AzurirajDobavljaca() {
    const { dobavljacId } = useParams();
    const [dobavljac, setDobavljac] = useState({
        dobavljacId: 0,
        dobavljacNaziv: "",
        adresaDobavljaca: "",
        brojTelefona: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`https://localhost:5001/api/home/dobavljaciDTO/${dobavljacId}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
        })
            .then(res => setDobavljac(res.data))
            .catch(err => {
                console.error("Greška prilikom dohvaćanja dobavljača:", err);
                alert("Greška prilikom dohvaćanja dobavljača.");
            });
    }, [dobavljacId]);

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.put(`https://localhost:5001/api/home/update_dobavljac/${dobavljacId}`, dobavljac, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
        })
            .then(() => {
                alert("Dobavljač je ažuriran.");
                navigate(`/dobavljac/${dobavljacId}/dokumenti`);
            })
            .catch(err => {
                console.error("Greška prilikom ažuriranja:", err);
                alert("Greška prilikom ažuriranja.");
            });
    };

    return (
        <div className="mt-4">
            <h4>Ažuriraj dobavljača</h4>
            <Form onSubmit={handleSubmit} className="mt-3" style={{ maxWidth: '500px' }}>
                <Form.Group className="mb-3">
                    <Form.Label>Naziv</Form.Label>
                    <Form.Control
                        type="text"
                        value={dobavljac.dobavljacNaziv}
                        onChange={(e) => setDobavljac({ ...dobavljac, dobavljacNaziv: e.target.value })}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Adresa</Form.Label>
                    <Form.Control
                        type="text"
                        value={dobavljac.adresaDobavljaca}
                        onChange={(e) => setDobavljac({ ...dobavljac, adresaDobavljaca: e.target.value })}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Broj telefona</Form.Label>
                    <Form.Control
                        type="text"
                        value={dobavljac.brojTelefona}
                        onChange={(e) => setDobavljac({ ...dobavljac, brojTelefona: e.target.value })}
                        required
                    />
                </Form.Group>
                <Button type="submit" variant="primary">Spremi promjene</Button>
            </Form>
        </div>
    );
}

export default AzurirajDobavljaca;
