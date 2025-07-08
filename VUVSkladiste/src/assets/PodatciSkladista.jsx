import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

function PodatciSkladista() {
    const [skladiste, setSkladiste] = useState({
        skladisteNaziv: "",
        adresaSkladista: "",
        brojTelefona: "",
        email: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // submit logic to API would go here
        alert("Podaci o skladištu spremljeni (demo)." );
    };

    return (
        <div className="mt-4">
            <h4>Podaci o skladištu</h4>
            <Form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
                <Form.Group className="mb-3">
                    <Form.Label>Naziv</Form.Label>
                    <Form.Control
                        type="text"
                        value={skladiste.skladisteNaziv}
                        onChange={(e) => setSkladiste({ ...skladiste, skladisteNaziv: e.target.value })}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Adresa</Form.Label>
                    <Form.Control
                        type="text"
                        value={skladiste.adresaSkladista}
                        onChange={(e) => setSkladiste({ ...skladiste, adresaSkladista: e.target.value })}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Broj telefona</Form.Label>
                    <Form.Control
                        type="text"
                        value={skladiste.brojTelefona}
                        onChange={(e) => setSkladiste({ ...skladiste, brojTelefona: e.target.value })}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={skladiste.email}
                        onChange={(e) => setSkladiste({ ...skladiste, email: e.target.value })}
                        required
                    />
                </Form.Group>
                <Button type="submit" variant="primary">Spremi</Button>
            </Form>
        </div>
    );
}

export default PodatciSkladista;
