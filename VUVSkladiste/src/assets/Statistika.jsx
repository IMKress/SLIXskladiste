import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Container, Card } from 'react-bootstrap';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

function ArtiklStatModal({ show, handleClose, artiklName, monthData, historyData }) {
  const chartData = {
    labels: monthData.map((m) => m.month),
    datasets: [
      {
        label: 'Zarada',
        data: monthData.map((m) => m.profit),
        backgroundColor: monthData.map((m) =>
          m.profit < 0 ? 'rgba(255, 99, 132, 0.6)' : 'rgba(54, 162, 235, 0.5)'
        ),
      },
    ],
  };

  const historyChart = {
    labels: historyData.map(h => h.date),
    datasets: [
      {
        label: 'Stanje',
        data: historyData.map(h => h.state),
        borderColor: 'rgba(255, 99, 132, 0.7)',
        fill: false,
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
        <Line data={historyChart} className="mt-4" />
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
  const [last30Data, setLast30Data] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [dailyMonthData, setDailyMonthData] = useState([]);
  const [mostSold, setMostSold] = useState([]);
  const [avgStorage, setAvgStorage] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    async function fetchData() {
      try {
        const [statsRes, artikliRes, last30Res, soldRes, avgRes] = await Promise.all([
          axios.get('https://localhost:5001/api/home/monthly_stats', { headers }),
          axios.get('https://localhost:5001/api/home/artikli_db', { headers }),
          axios.get('https://localhost:5001/api/home/daily_stats_last30', { headers }),
          axios.get('https://localhost:5001/api/home/most_sold_products', { headers }),
          axios.get('https://localhost:5001/api/home/average_storage_time', { headers }),
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
        const last30 = last30Res.data.map(d => ({
          day: d.dan,
          primke: d.primke,
          izdatnice: d.izdatnice,
          profit: d.izdatnice - d.primke,
        }));
        setLast30Data(last30);

        setArtikli(artikliRes.data);
        setMostSold(soldRes.data);
        setAvgStorage(avgRes.data);
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
      const [res, histRes] = await Promise.all([
        axios.get(`https://localhost:5001/api/home/monthly_stats/${artikl.artiklId}`, { headers }),
        axios.get(`https://localhost:5001/api/home/ModalGraphInfo/${artikl.artiklId}`, { headers })
      ]);
      const data = res.data.map((m) => ({
        month: m.mjesec,
        primke: m.primke,
        izdatnice: m.izdatnice,
        profit: m.izdatnice - m.primke,
      }));

      let stanje = 0;
      const hist = histRes.data.map((h) => {
        if (h.tipDokumentaId === 1) stanje += h.kolicina; else stanje -= h.kolicina;
        return { date: h.datumDokumenta.split('T')[0], state: stanje };
      });

      setSelectedArtikl({ name: artikl.artiklNaziv, data, history: hist });
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }

  };

  const handleMonthChange = async (e) => {
    const value = e.target.value;
    setSelectedMonth(value);
    if (!value) {
      setDailyMonthData([]);
      return;
    }
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const [year, month] = value.split('-');
    try {
      const res = await axios.get(
        `https://localhost:5001/api/home/daily_stats/${year}/${month}`,
        { headers }
      );
      const data = res.data.map((d) => ({
        day: d.dan,
        primke: d.primke,
        izdatnice: d.izdatnice,
        profit: d.izdatnice - d.primke,
      }));
      setDailyMonthData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const monthlyChartData = {
    labels: monthlyData.map((m) => m.month),
    datasets: [
      {
        label: 'Zarada',
        data: monthlyData.map((m) => m.profit),
        backgroundColor: monthlyData.map((m) =>
          m.profit < 0 ? 'rgba(255, 99, 132, 0.6)' : 'rgba(75,192,192,0.6)'
        ),
      },
    ],
  };

  const dailySource = dailyMonthData.length > 0 ? dailyMonthData : last30Data;
  const dailyChartData = {
    labels: dailySource.map((d) => d.day),
    datasets: [
      {
        label: 'Zarada',
        data: dailySource.map((d) => d.profit),
        backgroundColor: dailySource.map((d) =>
          d.profit < 0 ? 'rgba(255, 99, 132, 0.6)' : 'rgba(75,192,192,0.6)'
        ),
      },
    ],
  };

  const filteredArtikli = artikli.filter((a) =>
    a.artiklNaziv.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.artiklOznaka.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <Container className="mt-4">
      <Card className="p-3 mb-4">
        <h4 className="mb-3">Zarada zadnjih 12 mjeseci</h4>
        <Bar data={monthlyChartData} />

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

      <Card className="p-3 mb-4">
        <h4 className="mb-3">Zarada po danu</h4>
        <div className="mb-3">
          <label className="me-2">Odaberi mjesec:</label>
          <input type="month" value={selectedMonth} onChange={handleMonthChange} />
        </div>
        <Bar data={dailyChartData} />
        <Table striped bordered hover variant="light" className="mt-3">

          <thead>
            <tr>
              <th>Datum</th>
              <th>Ukupno Primke</th>
              <th>Ukupno Izdatnice</th>
              <th>Zarada</th>
            </tr>
          </thead>
          <tbody>
            {dailySource.map((d, idx) => (

              <tr key={idx}>
                <td>{d.day}</td>
                <td>{d.primke.toFixed(2)}</td>
                <td>{d.izdatnice.toFixed(2)}</td>
                <td>{d.profit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="p-3">
        <h4 className="mb-3">Artikli</h4>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Pretraži artikle"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Table striped bordered hover variant="light">
          <thead>
            <tr>
              <th>Oznaka</th>
              <th>Naziv</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            {filteredArtikli.map((a) => (
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

      <Card className="p-3 mt-4">
        <h4 className="mb-3">Najčešće prodavani proizvodi</h4>
        <Table striped bordered hover variant="light">
          <thead>
            <tr>
              <th>Naziv</th>
              <th>Količina</th>
            </tr>
          </thead>
          <tbody>
            {mostSold.map((m) => (
              <tr key={m.artiklId}>
                <td>{m.artiklNaziv}</td>
                <td>{m.totalKolicina}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="p-3 mt-4">
        <h4 className="mb-3">Prosječno vrijeme skladištenja</h4>
        <Table striped bordered hover variant="light">
          <thead>
            <tr>
              <th>Naziv</th>
              <th>Prosjek dana</th>
            </tr>
          </thead>
          <tbody>
            {avgStorage.map((a) => (
              <tr key={a.artiklId}>
                <td>{a.artiklNaziv}</td>
                <td>{a.prosjecniDani.toFixed(2)}</td>
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
          historyData={selectedArtikl.history}
        />
      )}
    </Container>
  );
}

export default Statistika;
