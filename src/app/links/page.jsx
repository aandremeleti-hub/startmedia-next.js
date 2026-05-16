'use client'

import { useModals } from '@/context/ModalContext';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Phone } from 'lucide-react';
import logo from '@/assets/images/home/logo.svg';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import './style.css';

export default function LinksPage() {
  const { openModal } = useModals();

  return (
    <main className="links-page">
      <div className="links-container">
        <div className="links-header">
          <Image src={logo} alt="StartMedia" width={100} height={100} className="links-logo" priority />
          <h1 className="links-title">STARTMEDIA</h1>
          <p className="links-subtitle">Soluções integradas em marketing, automação e inteligência artificial</p>
        </div>

        <div className="links-buttons">
          <div className="links-btn-tooltip-wrapper">
            <a
              href="https://startmediadigital.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="links-btn"
            >
              <span className="links-btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </span>
              Site Oficial
            </a>
            <span className="links-tooltip">Conheça todos os serviços StartMedia em nosso <strong>site completo</strong></span>
          </div>

          <div className="links-btn-tooltip-wrapper">
            <button
              onClick={() => openModal('contact')}
              className="links-btn"
            >
              <span className="links-btn-icon">
                <Calendar size={20} />
              </span>
              Marcar Reunião
            </button>
            <span className="links-tooltip">Agende uma conversa com nossos especialistas e descubra a <strong>solução ideal</strong> para seu negócio</span>
          </div>

          <div className="links-btn-tooltip-wrapper">
            <Link href="/diagnostico" className="links-btn">
              <span className="links-btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              Diagnóstico Gratuito
            </Link>
            <span className="links-tooltip">Responda a algumas perguntas e receba uma <strong>análise personalizada</strong> com recomendações estratégicas</span>
          </div>

          <div className="links-btn-tooltip-wrapper">
            <a href="tel:+5511950803544" className="links-btn">
              <span className="links-btn-icon">
                <Phone size={20} />
              </span>
              Contato por Telefone
            </a>
            <span className="links-tooltip">
              <strong>⚠ Importante:</strong> Ao clicar, alguém da <strong>Equipe Técnica</strong> entrará em contato por telefone <strong>dentro de 24 horas</strong>.
            </span>
          </div>

          <div className="links-btn-tooltip-wrapper">
            <a
              href="https://wa.me/5511950803544"
              target="_blank"
              rel="noopener noreferrer"
              className="links-btn"
            >
              <span className="links-btn-icon">
                <WhatsAppIcon size={20} />
              </span>
              WhatsApp Direto
            </a>
            <span className="links-tooltip">Fale conosco pelo WhatsApp e tenha <strong>suporte rápido e direto</strong> da nossa equipe</span>
          </div>
        </div>

        <div className="links-footer">
          <p>© 2025 STARTMEDIA. Todos os direitos reservados.</p>
        </div>
      </div>
    </main>
  );
}
