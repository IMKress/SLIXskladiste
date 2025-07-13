import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import logo from './img/logo.png';


function Navigacija() {
  const [userDetails, setUserDetails] = useState({ username: '', roles: [], UserId: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dokumentiOpen, setDokumentiOpen] = useState(false);
  const [narudzbenicaOpen, setNarudzbenicaOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('Username');
    const roles = JSON.parse(sessionStorage.getItem('Role') || '[]');
    const UserId = sessionStorage.getItem('UserId');

    if (token) {
      setUserDetails({ username, roles, UserId });
    }

    const validateToken = async () => {
      if (token) {
        try {
          await axios.get('https://localhost:5001/api/home/artikli_db', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          setIsLoggedIn(false);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    validateToken();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <>
      {/* Sidebar – stalno vidljiv */}
      <div className="sidebar">
       
        <ul className="sidebar-links ">
          <li><Link to="/PocetnaStranica">Početna</Link></li>
          <li><Link to="/Stanja">Artikli</Link></li>
          <li>
            <div className="d-flex justify-content-between" onClick={() => setDokumentiOpen(!dokumentiOpen)}>
              <Link to="/Dokumenti">Dokumenti</Link>
              <span style={{ cursor: 'pointer' }}>{dokumentiOpen ? '▲' : '▼'}</span>
            </div>
            {dokumentiOpen && (
              <ul className="submenu">
                <li><Link to="/Primka">Nova Primka</Link></li>
                <li><Link to="/Izdatnica">Nova Izdatnica</Link></li>
              </ul>
            )}
          </li>
          <li><Link to="/SkladistePodaci">Podaci o Skladištu</Link></li>
          <li>
            <div className="d-flex justify-content-between" onClick={() => setNarudzbenicaOpen(!narudzbenicaOpen)}>
              <Link to="/Narudzbenice">Narudžbenice</Link>
              <span style={{ cursor: 'pointer' }}>{narudzbenicaOpen ? '▲' : '▼'}</span>
            </div>
            {narudzbenicaOpen && (
              <ul className="submenu">
                <li><Link to="/NarudzbenicaNova">Nova Narudžbenica</Link></li>
              </ul>
            )}
          </li>
          <li><Link to="/Dobavljaci">Dobavljači</Link></li>
          <li><Link to="/Zaposlenici">Zaposlenici</Link></li>
          <li><Link to="/Statistika">Statistika</Link></li>

        </ul>
      </div>

      {/* Topbar */}
      
      <div className="topbar">
        <img src={logo} alt="logo" className="navbar-logo ms-3 mt-2" />
        <span className="ms-auto text-white">
          
          {isLoggedIn && `Trenutni račun: ${userDetails.username}`}
        </span>
        {isLoggedIn && (
          <button className="btn btn-danger ms-3" onClick={handleLogout}>Logout</button>
        )}
      </div>

      {/* Glavni sadržaj */}
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
}

export default Navigacija;
