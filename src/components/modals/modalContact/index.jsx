import React, { useState } from 'react';
import './style.css';
import Modal from '@mui/material/Modal';
import { Calendar, Phone, ArrowRight, CheckCircle, ExternalLink, X } from 'lucide-react';
import Image from 'next/image';
import logo from '../../../assets/images/home/logo.svg';
import { WhatsAppIcon } from '../../icons/WhatsAppIcon';

import { SCHEDULE, JS_DAY_TO_SCHEDULE, getAvailableDates, getFilteredSchedule } from '@/lib/dateUtils';

const AVAILABLE_DATES = getAvailableDates();
const SHORT_WEEKDAY = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const SHORT_MONTH = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export const ModalContact = ({ open, onClose }) => {
  const [step, setStep] = useState('lead'); // 'lead' | 'choice' | 'schedule' | 'success'
  const [lead, setLead] = useState({ nome: '', email: '', whatsapp: '' });
  const [ctaType, setCtaType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(AVAILABLE_DATES[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRetention, setShowRetention] = useState(false);

  const formatWhatsApp = (value) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  };

  const resetAndClose = () => {
    setStep('lead');
    setLead({ nome: '', email: '', whatsapp: '' });
    setCtaType(null);
    setSelectedTime(null);
    setShowRetention(false);
    onClose();
  };

  const handleCloseAttempt = (event, reason) => {
    if (step === 'choice') {
      if (reason === 'backdropClick') return;
      setShowRetention(true);
      return;
    }
    resetAndClose();
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    const digitsOnly = lead.whatsapp.replace(/\D/g, '');
    if (lead.nome && lead.email && digitsOnly.length === 11) {
      setStep('choice');
    } else if (digitsOnly.length !== 11) {
      alert("Por favor, insira um número de WhatsApp válido com 11 dígitos (DDD + 9 dígitos).");
    }
  };

  const handleCtaChoice = (type) => {
    setCtaType(type);
    if (type === 'reuniao') {
      setStep('schedule');
    } else {
      submitContact(type);
    }
  };

  const submitContact = async (type, extraData = null) => {
    setSubmitting(true);
    const dateTimeStr = extraData?.dateTime || null;
    
    try {
      // Reutilizando a mesma API do diagnóstico para manter consistência
      await fetch('/api/diagnostico-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: lead.nome,
          email: lead.email,
          whatsapp: lead.whatsapp,
          historico: [{ role: 'system', content: 'Contato direto via botão principal da Home' }],
          diagnosticoFinal: { pergunta: 'Contato direto sem diagnóstico' },
          ctaEscolhido: type,
          dataReuniao: dateTimeStr
        })
      });
    } catch (error) {
      console.error('Error submitting contact:', error);
    } finally {
      setSubmitting(false);
      setStep('success');
    }
  };

  const handleScheduleConfirm = () => {
    if (!selectedTime || !selectedDate) return;
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear();
    const weekdayName = JS_DAY_TO_SCHEDULE[selectedDate.getDay()];
    const dateTimeStr = `${day}/${month}/${year} (${weekdayName}) às ${selectedTime}`;
    submitContact('reuniao', { dateTime: dateTimeStr });
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseAttempt}
      slotProps={{
        backdrop: {
          style: {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(8, 8, 8, 0.75)',
          }
        }
      }}
    >
      <div className="modal-contact-container">
        <button className="modal-close-btn" onClick={() => handleCloseAttempt()}>
          <X size={24} />
        </button>

        <div className="modal-contact-content">
          <div className="modal-contact-header">
            <Image src={logo} alt="StartMedia" width={120} height={35} className="modal-contact-logo" />
            <p>Informações para contato</p>
          </div>

          {showRetention ? (
            <div className="modal-retention-screen" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>Tem certeza que deseja sair?</h3>
              <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '1.1rem' }}>Estamos a um passo de impulsionar os resultados do seu negócio.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => setShowRetention(false)} className="contact-primary-btn" style={{ flex: 1 }}>
                  Continuar
                </button>
                <button onClick={resetAndClose} className="contact-cta-secondary" style={{ flex: 1, border: '1px solid #444', background: 'transparent', color: '#fff' }}>
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP: LEAD FORM */}
          {step === 'lead' && (
            <form onSubmit={handleLeadSubmit} className="modal-contact-form">
              <div className="contact-input-group">
                <label>Como devemos te chamar?</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Seu nome"
                  value={lead.nome}
                  onChange={e => setLead({...lead, nome: e.target.value})}
                />
              </div>
              <div className="contact-input-group">
                <label>WhatsApp</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="(11) 99999-9999"
                  value={lead.whatsapp}
                  onChange={e => setLead({...lead, whatsapp: formatWhatsApp(e.target.value)})}
                  maxLength={15}
                />
              </div>
              <div className="contact-input-group">
                <label>E-mail profissional</label>
                <input 
                  type="email" 
                  required 
                  placeholder="contato@empresa.com.br"
                  value={lead.email}
                  onChange={e => setLead({...lead, email: e.target.value})}
                />
              </div>
              <button type="submit" className="contact-primary-btn">
                Próximo passo <ArrowRight size={20} />
              </button>
            </form>
          )}

          {/* STEP: CHOICE */}
          {step === 'choice' && (
            <div className="modal-cta-section">
              <button onClick={() => handleCtaChoice('reuniao')} className="contact-cta-primary">
                <Calendar size={22} /> Marcar Reunião com Especialista
              </button>
              <div className="contact-cta-secondaries">
                <button onClick={() => handleCtaChoice('telefone')} className="contact-cta-secondary">
                  <Phone size={18} /> Por telefone
                </button>
                <button onClick={() => handleCtaChoice('whatsapp')} className="contact-cta-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <WhatsAppIcon size={18} /> Por WhatsApp
                </button>
              </div>
            </div>
          )}

          {/* STEP: SCHEDULE */}
          {step === 'schedule' && (
            <div className="modal-schedule-picker">
              <h3 className="schedule-title"><Calendar size={18} /> Horários Disponíveis</h3>
              <div className="modal-date-carousel">
                {AVAILABLE_DATES.map((date, idx) => {
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  return (
                    <button
                      key={idx}
                      onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                      className={`modal-date-card ${isSelected ? 'active' : ''}`}
                    >
                      <span className="modal-date-day-name">{SHORT_WEEKDAY[date.getDay()]}</span>
                      <span className="modal-date-day-number">{date.getDate()}</span>
                      <span className="modal-date-month">{SHORT_MONTH[date.getMonth()]}</span>
                    </button>
                  );
                })}
              </div>
              <div className="modal-time-grid">
                {getFilteredSchedule(selectedDate).map(t => (
                  <button 
                    key={t} 
                    onClick={() => setSelectedTime(t)}
                    className={`modal-time-slot ${selectedTime === t ? 'selected' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {selectedTime && (
                <div className="modal-schedule-confirm">
                  <p>
                    <CheckCircle size={16} /> {selectedDate.getDate().toString().padStart(2, '0')}/{(selectedDate.getMonth() + 1).toString().padStart(2, '0')} às {selectedTime}
                  </p>
                  <button onClick={handleScheduleConfirm} className="contact-primary-btn" disabled={submitting}>
                    {submitting ? 'Confirmando...' : 'Confirmar Reunião'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && (
            <div className="modal-success-screen">
              <CheckCircle size={60} className="success-icon-glow" />
              {ctaType === 'reuniao' ? (
                <>
                  <h3>Reunião Confirmada! 🚀</h3>
                  <p>Enviamos os detalhes para <strong>{lead.email}</strong>. Nosso especialista entrará em contato com o link da reunião em breve.</p>
                </>
              ) : (
                <>
                  <h3>Solicitação Recebida! 💬</h3>
                  <p>Nossa equipe técnica entrará em contato com você <strong>em até 24 horas</strong>.</p>
                </>
              )}
              <button onClick={resetAndClose} className="contact-primary-btn" style={{marginTop: '2rem'}}>
                Fechar
              </button>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
