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
  const [joinedData, setJoinedData] = useState([]);
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
        const [joinedRes, artikliRes] = await Promise.all([
          axios.get('https://localhost:5001/api/home/joined_artikls_db', { headers }),
          axios.get('https://localhost:5001/api/home/artikli_db', { headers }),
        ]);
        setJoinedData(joinedRes.data);
        setArtikli(artikliRes.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (joinedData.length === 0) return;
    const monthMap = {};
    let totalPrimke = 0;
    let totalIzdatnice = 0;

    joinedData.forEach((item) => {
      const date = new Date(item.datumDokumenta);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { primke: 0, izdatnice: 0 };
      }
      if (item.tipDokumenta === 'Primka') {
        monthMap[monthKey].primke += item.ukupnaCijena;
        totalPrimke += item.ukupnaCijena;
      } else if (item.tipDokumenta === 'Izdatnica') {
        monthMap[monthKey].izdatnice += item.ukupnaCijena;
        totalIzdatnice += item.ukupnaCijena;
      }
    });

    const data = Object.entries(monthMap).map(([month, vals]) => ({
      month,
      primke: vals.primke,
      izdatnice: vals.izdatnice,
      profit: vals.primke - vals.izdatnice,
    }));
    data.sort((a, b) => (a.month > b.month ? 1 : -1));
    setMonthlyData(data);
    setWarehouseValue(totalPrimke - totalIzdatnice);
  }, [joinedData]);

  const handleArtiklInfo = (artikl) => {
    const monthMap = {};
    joinedData
      .filter((i) => i.artiklId === artikl.artiklId)
      .forEach((item) => {
        const date = new Date(item.datumDokumenta);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthMap[monthKey]) {
          monthMap[monthKey] = { primke: 0, izdatnice: 0 };
        }
        if (item.tipDokumenta === 'Primka') {
          monthMap[monthKey].primke += item.ukupnaCijena;
        } else if (item.tipDokumenta === 'Izdatnica') {
          monthMap[monthKey].izdatnice += item.ukupnaCijena;
        }
      });
    const data = Object.entries(monthMap).map(([month, vals]) => ({
      month,
      primke: vals.primke,
      izdatnice: vals.izdatnice,
      profit: vals.primke - vals.izdatnice,
    }));
    data.sort((a, b) => (a.month > b.month ? 1 : -1));
    setSelectedArtikl({ name: artikl.artiklNaziv, data });
    setShowModal(true);
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
