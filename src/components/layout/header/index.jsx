"use client";

import { useState } from 'react';
import './style.css';
import logo from '../../../assets/images/home/logo.svg';
import Link from 'next/link';
import Image from 'next/image';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="main-header">
            <Link href="/" className="logo-link">
                <Image src={logo} alt="StartMedia Logo" className="header-logo-img" priority />
            </Link>
            
            {/* Hamburger Button for Mobile */}
            <button 
                className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
                onClick={toggleMenu}
                aria-label="Menu"
            >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            <nav className={`nav-header ${isMenuOpen ? 'open' : ''}`}>
                <ul>
                    <li><Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
                    <li><Link href="/design" onClick={() => setIsMenuOpen(false)}>Design</Link></li>
                    <li><Link href="/site" onClick={() => setIsMenuOpen(false)}>Site</Link></li>
                    <li><Link href="/ia" onClick={() => setIsMenuOpen(false)}>Ia</Link></li>
                </ul>
                {/* Botão de diagnóstico visível apenas no menu mobile */}
                <Link className='btn-header mobile-btn' href="/diagnostico" onClick={() => setIsMenuOpen(false)}>
                    Diagnóstico
                </Link>
            </nav>

            {/* Botão de diagnóstico visível apenas no desktop */}
            <Link className='btn-header desktop-btn' href="/diagnostico">
                Diagnóstico
            </Link>
        </header>
    );
};