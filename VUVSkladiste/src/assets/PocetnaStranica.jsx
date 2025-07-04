import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Table, Button, Card, Container } from 'react-bootstrap';

function Pocetna() {
    const baseURL = "https://localhost:5001/api/home/artikli_db";
    const [artikli, setArtikli] = useState([]);
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userDetails, setUserDetails] = useState({ username: '', roles: [] });

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
        axios({
            method: 'get',
            url: baseURL,
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        }).then(response => {
            setArtikli(response.data);
        }).catch(error => {
            console.error(error);
            alert("Greška prilikom učitavanja podataka");
        });
    }, []);

    return (
        <Container className="mt-5">
            {isAuthenticated && userDetails.roles && (
                <>
                    <h1 className="text-light">Dobrodošli: {userDetails.username}</h1>

                    {/* Otvorene narudžbenice */}
                    <Card className="form-card">
                        <Card.Header className="text-light" as="h4">Otvorene narudžbenice</Card.Header>
                        <Card.Body>
                            <Table striped bordered hover variant="light">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Datum stvaranja</th>
                                        <th>Info</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td></td>
                                        <td></td>
                                    </tr><tr>
                                        <th scope="row">1</th>
                                        <td></td>
                                        <td></td>
                                    </tr><tr>
                                        <th scope="row">1</th>
                                        <td></td>
                                        <td></td>
                                    </tr><tr>
                                        <th scope="row">1</th>
                                        <td></td>
                                        <td></td>
                                    </tr>
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
                                    <tr>
                                        <th scope="row">1</th>
                                        <td></td>
                                        <td></td>
                                        <td></td>                                        <td></td>

                                    </tr><tr>
                                        <th scope="row">1</th>
                                        <td></td>
                                        <td></td>
                                        <td></td>                                        <td></td>

                                    </tr><tr>
                                        <th scope="row">1</th>
                                        <td></td>
                                        <td></td>
                                        <td></td>                                        <td></td>

                                    </tr><tr>
                                        <th scope="row">1</th>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
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
