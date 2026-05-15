import React, { useState } from 'react';
import './style.css';
import Modal from '@mui/material/Modal';
import { Calendar, Phone, ArrowRight, CheckCircle, ExternalLink, X } from 'lucide-react';
import Image from 'next/image';
import logo from '../../../assets/images/home/logo.svg';

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const SCHEDULE = {
  'Segunda-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  'Terça-feira': ['08:00', '09:00', '10:00', '11:00'],
  'Quarta-feira': ['08:00', '09:00', '10:00', '11:00'],
  'Quinta-feira': ['08:00', '09:00', '10:00', '11:00'],
  'Sexta-feira': ['08:00', '09:00', '10:00', '11:00'],
  'Sábado': ['08:00', '09:00', '10:00', '11:00'],
};
const DAYS = Object.keys(SCHEDULE);
const MEET_LINK = 'https://meet.google.com/new';

export const ModalContact = ({ open, onClose }) => {
  const [step, setStep] = useState('lead'); // 'lead' | 'choice' | 'schedule' | 'success'
  const [lead, setLead] = useState({ nome: '', email: '', whatsapp: '' });
  const [ctaType, setCtaType] = useState(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
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
          dataReuniao: dateTimeStr,
          linkMeet: type === 'reuniao' ? MEET_LINK : null
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
    if (!selectedTime) return;
    submitContact('reuniao', { dateTime: `${selectedDay} às ${selectedTime}` });
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
            <p>Informações de contato</p>
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
              <div className="modal-day-tabs">
                {DAYS.map(d => (
                  <button 
                    key={d} 
                    onClick={() => { setSelectedDay(d); setSelectedTime(null); }}
                    className={`modal-day-tab ${selectedDay === d ? 'active' : ''}`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
              <div className="modal-time-grid">
                {SCHEDULE[selectedDay].map(t => (
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
                  <p><CheckCircle size={16} /> {selectedDay} às {selectedTime}</p>
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
                  <p>Enviamos os detalhes para <strong>{lead.email}</strong>. Prepare-se para transformar o seu negócio.</p>
                  <a href={MEET_LINK} target="_blank" rel="noopener noreferrer" className="modal-meet-link">
                    <ExternalLink size={18} /> Abrir Google Meet
                  </a>
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
