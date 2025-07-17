import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Container, Card } from 'react-bootstrap';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ArtiklStatModal({ show, handleClose, artiklName, monthData }) {
  const chartData = {
    labels: monthData.map(m => m.month),
    datasets: [
      {
        label: 'Zarada',
        data: monthData.map(m => m.profit),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Statistika Artikla: {artiklName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Bar data={chartData} />
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Mjesec</th>
              <th>Ukupno Primke</th>
              <th>Ukupno Izdatnice</th>
              <th>Zarada</th>
            </tr>
          </thead>
          <tbody>
            {monthData.map((m, idx) => (
              <tr key={idx}>
                <td>{m.month}</td>
                <td>{m.primke.toFixed(2)}</td>
                <td>{m.izdatnice.toFixed(2)}</td>
                <td>{m.profit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Zatvori
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function Statistika() {
  const [artikli, setArtikli] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [warehouseValue, setWarehouseValue] = useState(0);
  const [selectedArtikl, setSelectedArtikl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    async function fetchData() {
      try {
        const [statsRes, artikliRes] = await Promise.all([
          axios.get('https://localhost:5001/api/home/monthly_stats', { headers }),
          axios.get('https://localhost:5001/api/home/artikli_db', { headers }),
        ]);

        const data = statsRes.data.map((m) => ({
          month: m.mjesec,
          primke: m.primke,
          izdatnice: m.izdatnice,
          profit: m.izdatnice - m.primke,
        }));
        let totalPrimke = 0;
        let totalIzdatnice = 0;
        data.forEach((d) => {
          totalPrimke += d.primke;
          totalIzdatnice += d.izdatnice;
        });
        setWarehouseValue(totalPrimke - totalIzdatnice);
        setMonthlyData(data);
        setArtikli(artikliRes.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, []);

  const handleArtiklInfo = async (artikl) => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(
        `https://localhost:5001/api/home/monthly_stats/${artikl.artiklId}`,
        { headers }
      );
      const data = res.data.map((m) => ({
        month: m.mjesec,
        primke: m.primke,
        izdatnice: m.izdatnice,
        profit: m.izdatnice - m.primke,
      }));
      setSelectedArtikl({ name: artikl.artiklNaziv, data });
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = {
    labels: monthlyData.map((m) => m.month),
    datasets: [
      {
        label: 'Zarada',
        data: monthlyData.map((m) => m.profit),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  return (
    <Container className="mt-4">
      <Card className="p-3 mb-4">
        <h4 className="mb-3">Zarada po mjesecu</h4>
        <Bar data={chartData} />
        <Table striped bordered hover variant="light" className="mt-3">
          <thead>
            <tr>
              <th>Mjesec</th>
              <th>Ukupno Primke</th>
              <th>Ukupno Izdatnice</th>
              <th>Zarada</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((m, idx) => (
              <tr key={idx}>
                <td>{m.month}</td>
                <td>{m.primke.toFixed(2)}</td>
                <td>{m.izdatnice.toFixed(2)}</td>
                <td>{m.profit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <h5 className="mt-3">Trenutna vrijednost skladišta: {warehouseValue.toFixed(2)}</h5>
      </Card>

      <Card className="p-3">
        <h4 className="mb-3">Artikli</h4>
        <Table striped bordered hover variant="light">
          <thead>
            <tr>
              <th>Oznaka</th>
              <th>Naziv</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            {artikli.map((a) => (
              <tr key={a.artiklId}>
                <td>{a.artiklOznaka}</td>
                <td>{a.artiklNaziv}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => handleArtiklInfo(a)}>
                    Info
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {selectedArtikl && (
        <ArtiklStatModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          artiklName={selectedArtikl.name}
          monthData={selectedArtikl.data}
        />
      )}
    </Container>
  );
}

export default Statistika;
