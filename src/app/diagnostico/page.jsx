'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './style.module.css';
import { Send, Sparkles, CheckCircle, ArrowRight, Phone, MessageSquare, Calendar, ExternalLink, Clock } from 'lucide-react';
import logo from '../../assets/images/home/logo.svg';
import Image from 'next/image';
import { checkExistingLead } from '@/lib/supabase';

import { SCHEDULE, JS_DAY_TO_SCHEDULE, getAvailableDates, getFilteredSchedule } from '@/lib/dateUtils';

const AVAILABLE_DATES = getAvailableDates();

// Nomes abreviados dos dias da semana para exibição no carrossel
const SHORT_WEEKDAY = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const SHORT_MONTH = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Timer: 120s primeira pergunta, 60s texto, 30s chips
const FIRST_TEXT_TIMEOUT = 120;
const TEXT_TIMEOUT = 60;
const CHIP_TIMEOUT = 30;

export default function DiagnosticoPage() {
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalResult, setFinalResult] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [otherInput, setOtherInput] = useState('');
  const [showOther, setShowOther] = useState(false);
  const [selectedChips, setSelectedChips] = useState([]);
  const [encerradoPorOfensa, setEncerradoPorOfensa] = useState(false);

  // Lead
  const [lead, setLead] = useState({ nome: '', email: '', whatsapp: '' });
  const [step, setStep] = useState('lead');
  const [returningLead, setReturningLead] = useState(null);
  const [returningContext, setReturningContext] = useState('');

  // Timer
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(TEXT_TIMEOUT);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  // Ref de segurança: impede a race condition onde o setStep('timeout')
  // já foi enfileirado pelo React antes do clearInterval executar.
  const shouldTimeoutRef = useRef(false);

  // Resultado CTAs
  const [ctaStep, setCtaStep] = useState('choice'); // 'choice' | 'schedule' | 'success'
  const [ctaType, setCtaType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(AVAILABLE_DATES[0]); // Date object
  const [selectedTime, setSelectedTime] = useState(null);
  const [submittingCta, setSubmittingCta] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (step === 'quiz') scrollToBottom(); }, [history, currentQuestion, step]);

  // ── Timer Logic ──────────────────────────────────────────────────────────────
  const clearAllTimers = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(countdownRef.current);
    clearTimeout(typingTimeoutRef.current);
    timerRef.current = null;
    countdownRef.current = null;
    typingTimeoutRef.current = null;
  }, []);

  // Inicia o intervalo de contagem regressiva (a barra descendo)
  const startTimerInterval = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setShowTimeoutModal(true);
          setCountdownSeconds(10);

          // Limpa qualquer intervalo anterior antes de iniciar o novo
          if (countdownRef.current) clearInterval(countdownRef.current);

          countdownRef.current = setInterval(() => {
            setCountdownSeconds(p => {
              if (p <= 1) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
                // Encerramento incondicional da sessão
                setShowTimeoutModal(false);
                setStep('timeout');
                return 0;
              }
              return p - 1;
            });
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Calcula a duração correta baseada na pergunta atual
  const getTimerDuration = useCallback(() => {
    if (currentQuestion?.tipo === 'chips' || currentQuestion?.tipo === 'selecao') {
      return CHIP_TIMEOUT;
    }
    if (!currentQuestion || currentQuestion.perguntaNumero === 1) {
      return FIRST_TEXT_TIMEOUT;
    }
    return TEXT_TIMEOUT;
  }, [currentQuestion]);

  // Cada tecla digitada: zera o timer e para a contagem.
  // Só inicia a contagem após 10 segundos sem digitar nada.
  const handleTyping = useCallback(() => {
    // Para o timer (a barra para de descer)
    clearInterval(timerRef.current);
    timerRef.current = null;

    // Reseta a barra pro topo (duração completa)
    const duration = getTimerDuration();
    setTimerSeconds(duration);

    // Cancela qualquer espera anterior de "10s de inatividade"
    clearTimeout(typingTimeoutRef.current);

    // Após 10s sem digitar → inicia o timer do zero
    typingTimeoutRef.current = setTimeout(() => {
      startTimerInterval();
    }, 10000);
  }, [getTimerDuration, startTimerInterval]);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    shouldTimeoutRef.current = false;
    setShowTimeoutModal(false);
    setCountdownSeconds(10);
    const duration = getTimerDuration();
    setTimerSeconds(duration);
    setTimerActive(true);
    startTimerInterval();
  }, [clearAllTimers, getTimerDuration, startTimerInterval]);

  useEffect(() => {
    if (currentQuestion && step === 'quiz') {
      resetTimer();
    }
    return () => clearAllTimers();
  }, [currentQuestion, step]);

  // ── Pausa inteligente do timer durante o carregamento da IA ──────────────────
  // Skill: clean-code — Enquanto a IA está gerando a resposta (loading=true),
  // paramos o intervalo para que o countdown não expire durante a espera.
  useEffect(() => {
    if (loading) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [loading]);

  useEffect(() => { return () => clearAllTimers(); }, []);

  const handleResumeSession = () => {
    // 1. Desativa a trava ANTES de tudo — impede qualquer timeout enfileirado
    shouldTimeoutRef.current = false;
    // 2. Limpa todos os intervalos
    clearAllTimers();
    // 3. Esconde o modal
    setShowTimeoutModal(false);
    // 4. Reinicia o timer do zero com a duração completa
    resetTimer();
  };

  // ── Lead Capture ─────────────────────────────────────────────────────────────
  const handleStartQuiz = async (e) => {
    e.preventDefault();
    if (!lead.nome || !lead.email || !lead.whatsapp) return;

    // Verificar lead recorrente
    const { exists, lead: existingLead } = await checkExistingLead(lead.email, lead.whatsapp);
    if (exists && existingLead) {
      setReturningLead(existingLead);
      setStep('returning');
      return;
    }

    setStep('quiz');
    await fetchNextQuestion();
  };

  const handleReturningContinue = async () => {
    setStep('quiz');
    const message = returningContext
      ? `Sou um cliente recorrente. Última visita: ${new Date(returningLead.created_at).toLocaleDateString('pt-BR')}. O que mudou: ${returningContext}`
      : 'Sou um cliente recorrente. Gostaria de atualizar meu diagnóstico.';
    await fetchNextQuestion(message);
  };

  // ── Quiz Logic ────────────────────────────────────────────────────────────────
  const fetchNextQuestion = async (userAnswer = '', currentHistory = history) => {
    clearAllTimers();
    setTimerActive(false);
    setLoading(true);
    try {
      const response = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: currentHistory, // Envia o histórico atualizado real, sem depender do estado assíncrono do React
          userMessage: userAnswer
            ? userAnswer
            : 'Inicie o diagnóstico com a mensagem de abertura e a primeira pergunta.'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error || 'Erro ao conectar com o diagnóstico.';
        console.error('API Error:', response.status, errorMsg);
        setCurrentQuestion({
          pergunta: `⚠️ ${errorMsg} Por favor, tente novamente em alguns segundos.`,
          tipo: 'texto',
          perguntaNumero: currentQuestion?.perguntaNumero || 1
        });
        return;
      }

      if (data.encerradoPorOfensa) {
        setEncerradoPorOfensa(true);
        setStep('encerrado');
        return;
      }

      if (data.isFinal) {
        setFinalResult(data);
        setStep('result');
        setCtaStep('choice');
      } else {
        setCurrentQuestion(data);
        setSelectedChips([]);
        setShowOther(false);
        setOtherInput('');
        setInputValue('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e?.preventDefault();
    const answer = inputValue.trim();
    if (!answer) return;

    // Constrói o histórico da API: inclui a pergunta atual que está sendo respondida
    const apiHistory = [
      ...history,
      { role: 'assistant', content: currentQuestion.pergunta }
    ];

    // Atualiza a interface (aqui incluímos a resposta do usuário para aparecer no balão)
    setHistory(prev => [
      ...prev,
      { role: 'assistant', content: currentQuestion.pergunta },
      { role: 'user', content: answer }
    ]);

    setCurrentQuestion(null);
    setInputValue('');
    setShowOther(false);
    setOtherInput('');
    await fetchNextQuestion(answer, apiHistory);
  };

  const handleChipToggle = (opcao) => {
    handleTyping(); // Renova o tempo de atividade do lead no timer

    if (selectedChips.includes(opcao)) {
      setSelectedChips(prev => prev.filter(item => item !== opcao));
      if (opcao === 'Outro') {
        setShowOther(false);
        setOtherInput('');
      }
    } else {
      if (selectedChips.length >= 5) return;
      setSelectedChips(prev => [...prev, opcao]);
      if (opcao === 'Outro') {
        setShowOther(true);
      }
    }
  };

  const handleMultiSelectSubmit = async (e) => {
    e?.preventDefault();

    const chipsWithoutOutro = selectedChips.filter(c => c !== 'Outro');
    const hasOutro = selectedChips.includes('Outro');
    const customText = hasOutro ? otherInput.trim() : '';

    if (chipsWithoutOutro.length === 0 && !customText) return;

    let answerParts = [...chipsWithoutOutro];
    if (customText) {
      answerParts.push(customText);
    }
    const answer = answerParts.join(', ');

    const apiHistory = [
      ...history,
      { role: 'assistant', content: currentQuestion.pergunta }
    ];

    setHistory(prev => [
      ...prev,
      { role: 'assistant', content: currentQuestion.pergunta },
      { role: 'user', content: answer }
    ]);

    setCurrentQuestion(null);
    setSelectedChips([]);
    setShowOther(false);
    setOtherInput('');
    setInputValue('');

    await fetchNextQuestion(answer, apiHistory);
  };

  // ── CTA Logic ─────────────────────────────────────────────────────────────────
  const handleCtaChoice = (type) => {
    setCtaType(type);
    if (type === 'reuniao') { setCtaStep('schedule'); }
    else { handleCtaSubmit(type); }
  };

  const handleCtaSubmit = async (type, data = null) => {
    setSubmittingCta(true);
    const ctaFinal = type || ctaType;
    const dateTimeStr = data?.dateTime || null;
    try {
      await fetch('/api/diagnostico-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: lead.nome,
          email: lead.email,
          whatsapp: lead.whatsapp,
          historico: history,
          diagnosticoFinal: finalResult,
          ctaEscolhido: ctaFinal,
          dataReuniao: dateTimeStr
        })
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingCta(false);
      setCtaType(ctaFinal);
      setCtaStep('success');
    }
  };

  const handleScheduleConfirm = () => {
    if (!selectedTime || !selectedDate) return;
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear();
    const weekdayName = JS_DAY_TO_SCHEDULE[selectedDate.getDay()];
    const dateTimeStr = `${day}/${month}/${year} (${weekdayName}) às ${selectedTime}`;
    handleCtaSubmit('reuniao', { dateTime: dateTimeStr });
  };

  // ── Progress ──────────────────────────────────────────────────────────────────
  const progressPercent = currentQuestion?.perguntaNumero
    ? Math.round((currentQuestion.perguntaNumero / 8) * 100)
    : 0;

  const timerMax = getTimerDuration();
  const timerPercent = timerActive ? Math.round((timerSeconds / timerMax) * 100) : 100;
  const timerColor = timerPercent > 50 ? '#00FF85' : timerPercent > 20 ? '#FFD700' : '#FF4444';

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>

        {/* ── STEP: LEAD ── */}
        {step === 'lead' && (
          <div className={styles.card}>
            <div className={styles.header}>
              <Image src={logo} alt="StartMedia Logo" className={styles.headerLogo} />
              <h1 className={styles.title}>Diagnóstico Digital</h1>
              <p className={styles.subtitle}>Descubra o que o seu negócio precisa para crescer com inteligência digital.</p>
            </div>
            <form onSubmit={handleStartQuiz} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="nome">Como devemos te chamar?</label>
                <input id="nome" type="text" value={lead.nome} onChange={e => setLead({ ...lead, nome: e.target.value })} placeholder="Seu nome ou da empresa" required />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="whatsapp">Qual o seu melhor WhatsApp?</label>
                <input id="whatsapp" type="tel" value={lead.whatsapp} onChange={e => setLead({ ...lead, whatsapp: e.target.value })} placeholder="(11) 99999-9999" required />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="email">E o seu e-mail profissional?</label>
                <input id="email" type="email" value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} placeholder="contato@suaempresa.com.br" required />
              </div>
              <button type="submit" className={styles.primaryButton}>
                Iniciar Diagnóstico <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {/* ── STEP: RETURNING LEAD ── */}
        {step === 'returning' && returningLead && (
          <div className={styles.card}>
            <div className={styles.header}>
              <Image src={logo} alt="StartMedia Logo" className={styles.headerLogo} />
              <h1 className={styles.title}>Olá novamente, {returningLead.nome}! 👋</h1>
              <p className={styles.subtitle}>
                Encontramos seu diagnóstico anterior de{' '}
                <strong className={styles.greenText}>
                  {new Date(returningLead.created_at).toLocaleDateString('pt-BR')}
                </strong>
                . O que mudou no seu negócio desde então?
              </p>
            </div>
            <div className={styles.form}>
              <textarea
                className={styles.returningTextarea}
                placeholder="Ex: Abri uma nova unidade, mudei o foco do negócio, os resultados melhoraram..."
                value={returningContext}
                onChange={e => setReturningContext(e.target.value)}
                rows={4}
              />
              <button onClick={handleReturningContinue} className={styles.primaryButton}>
                Atualizar Diagnóstico <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: QUIZ ── */}
        {step === 'quiz' && (
          <div className={styles.chatContainer}>
            {/* Bloco superior fixo (Blur) */}
            <div className={styles.topStickyArea}>
              {/* Header */}
              <div className={styles.chatHeader}>
                <Image src={logo} alt="StartMedia Logo" className={styles.chatLogo} />
                <div className={styles.chatHeaderText}>
                  <h2>STARTMEDIA IA</h2>
                  <span className={styles.chatHeaderSub}>Diagnóstico Digital Personalizado</span>
                </div>
                <div className={styles.onlineIndicator}><span className={styles.onlineDot}></span>Online</div>
              </div>

              {/* Progress Bar */}
              {currentQuestion?.perguntaNumero && (
                <div className={styles.progressWrap}>
                  <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
                  <span className={styles.progressLabel}>Pergunta {currentQuestion.perguntaNumero} de 8</span>
                </div>
              )}

              {/* Timer Bar */}
              {timerActive && (
                <div className={styles.timerBarWrap}>
                  <div
                    className={styles.timerBar}
                    style={{ width: `${timerPercent}%`, background: timerColor }}
                  />
                </div>
              )}
            </div>

            {/* Messages */}
            <div className={styles.messagesArea}>
              {history.map((msg, i) => (
                <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
                  {msg.content}
                </div>
              ))}

              {loading && (
                <div className={`${styles.message} ${styles.aiMessage} ${styles.loadingMessage}`}>
                  <Image src={logo} alt="Carregando" className={styles.loadingLogo} />
                  <span>Analisando...</span>
                </div>
              )}

              {!loading && currentQuestion && (
                <div className={`${styles.message} ${styles.aiMessage}`}>
                  <p>{currentQuestion.pergunta}</p>

                  {/* Research Card */}
                  {currentQuestion.dadoPesquisa && currentQuestion.dadoPesquisa.estatistica && (
                    <div className={styles.researchCard}>
                      <span className={styles.researchIcon}>📊</span>
                      <div>
                        <p className={styles.researchStat}>{currentQuestion.dadoPesquisa.estatistica}</p>
                        <p className={styles.researchContext}>{currentQuestion.dadoPesquisa.contexto}</p>
                        {currentQuestion.dadoPesquisa.link ? (
                          <a href={currentQuestion.dadoPesquisa.link} target="_blank" rel="noopener noreferrer" className={styles.researchLink}>
                            {currentQuestion.dadoPesquisa.fonte} <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className={styles.researchSource}>{currentQuestion.dadoPesquisa.fonte}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Chips / Options */}
                  {(currentQuestion.tipo === 'chips' || currentQuestion.tipo === 'selecao') && (
                    <>
                      <div className={styles.chipOptions}>
                        {currentQuestion.opcoes?.map((op, i) => (
                          <button
                            key={i}
                            onClick={() => handleChipToggle(op)}
                            className={`${styles.chipButton} ${selectedChips.includes(op) ? styles.chipActive : ''}`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>

                      {/* "Outro" free text */}
                      {selectedChips.includes('Outro') && (
                        <div className={styles.outroContainer}>
                          <input
                            type="text"
                            maxLength={100}
                            value={otherInput}
                            onChange={e => { setOtherInput(e.target.value); handleTyping(); }}
                            placeholder="Descreva outra opção em até 100 caracteres..."
                            className={styles.outroInput}
                            autoFocus
                          />
                          <span className={styles.charCounter}>{otherInput.length}/100</span>
                        </div>
                      )}

                      {/* Botão Premium de Envio */}
                      <div className={styles.submitContainer}>
                        <button
                          onClick={handleMultiSelectSubmit}
                          disabled={selectedChips.length === 0 || (selectedChips.includes('Outro') && !otherInput.trim())}
                          className={styles.premiumSubmitButton}
                        >
                          <span>
                            {selectedChips.length === 0 || (selectedChips.includes('Outro') && !otherInput.trim())
                              ? "Selecione uma opção..."
                              : (selectedChips.length > 1 ? `Enviar ${selectedChips.length} Respostas` : "Enviar Resposta")}
                          </span>
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Text input area */}
            {currentQuestion && currentQuestion.tipo !== 'chips' && currentQuestion.tipo !== 'selecao' && !showOther && (
              <form onSubmit={handleAnswerSubmit} className={styles.inputArea}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => { setInputValue(e.target.value); handleTyping(); }}
                  placeholder="Digite sua resposta aqui..."
                  className={styles.chatInput}
                  autoFocus
                />
                <button type="submit" className={styles.sendButton} disabled={!inputValue.trim()}>
                  <Send size={20} />
                </button>
              </form>
            )}

            {/* Timeout Modal */}
            {showTimeoutModal && (
              <div className={styles.timeoutOverlay}>
                <div className={styles.timeoutModal}>
                  <Clock size={32} className={styles.iconGlow} />
                  <h3>Ainda está aí?</h3>
                  <p>Sua sessão será encerrada em</p>
                  <span className={styles.countdown}>{countdownSeconds}</span>
                  <button onClick={handleResumeSession} className={styles.primaryButton}>
                    Continuar Diagnóstico
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: ENCERRADO POR OFENSA ── */}
        {step === 'encerrado' && (
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <Image src={logo} alt="StartMedia Logo" className={styles.headerLogo} style={{ margin: '0 auto 1.5rem' }} />
            <p className={styles.subtitle}>Seu chat foi encerrado.</p>
          </div>
        )}

        {/* ── STEP: TIMEOUT ── */}
        {step === 'timeout' && (
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <Image src={logo} alt="StartMedia Logo" className={styles.headerLogo} style={{ margin: '0 auto 1.5rem' }} />
            <h2 className={styles.title}>Sessão Encerrada</h2>
            <p className={styles.subtitle}>Parece que você se afastou. Quando quiser, pode iniciar um novo diagnóstico.</p>
            <a href="/" className={styles.primaryButton} style={{ marginTop: '2rem', display: 'inline-flex' }}>
              Voltar à página inicial <ArrowRight size={20} />
            </a>
          </div>
        )}

        {/* ── STEP: RESULT ── */}
        {step === 'result' && finalResult && (
          <div className={styles.resultCard}>

            {/* Result Header */}
            <div className={styles.resultHeader}>
              <Image src={logo} alt="StartMedia Logo" className={styles.resultLogo} />
              <div>
                <h1 className={styles.resultTitle}>Seu Diagnóstico está Pronto!</h1>
                <p className={styles.resultSubtitle}>Analisamos o seu negócio e estruturamos um plano de crescimento personalizado.</p>
              </div>
            </div>

            <div className={styles.resultContent}>

              {/* Diagnóstico textual */}
              <div className={styles.resultSection}>
                <h3>O que descobrimos:</h3>
                <p>{finalResult.pergunta}</p>
              </div>

              {/* Cards de justificativa */}
              {finalResult.justificativas && finalResult.justificativas.length > 0 && (
                <div className={styles.resultSection}>
                  <h3>Por que investir nisso?</h3>
                  <div className={styles.justificativasGrid}>
                    {finalResult.justificativas.map((j, i) => (
                      <div key={i} className={styles.justificativaCard}>
                        <div className={styles.justificativaHeader}>
                          <Sparkles size={16} className={styles.iconGlow} />
                          <strong>{j.servico}</strong>
                        </div>
                        <p className={styles.justificativaReason}>{j.razao}</p>
                        <div className={styles.justificativaStat}>
                          <span className={styles.statText}>📊 {j.estatistica}</span>
                          {j.link ? (
                            <a href={j.link} target="_blank" rel="noopener noreferrer" className={styles.statLink}>
                              {j.fonte} <ExternalLink size={11} />
                            </a>
                          ) : (
                            <span className={styles.statSource}>{j.fonte}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de serviços */}
              <div className={styles.resultSection}>
                <h3>Serviços Recomendados para Você:</h3>
                <ul className={styles.serviceList}>
                  {finalResult.servicosRecomendados?.map((s, i) => (
                    <li key={i}><Sparkles size={14} /> {s}</li>
                  ))}
                </ul>
              </div>

              {/* Investimento */}
              <div className={styles.resultSection}>
                <h3>Investimento Estimado:</h3>
                <p className={styles.investment}>{finalResult.estimativaInvestimento}</p>
                <p className={styles.disclaimer}>{finalResult.disclaimerOrcamento}</p>
              </div>
            </div>

            {/* ── CTAs ── */}
            {ctaStep === 'choice' && (
              <div className={styles.ctaSection}>
                <button onClick={() => handleCtaChoice('reuniao')} className={styles.ctaPrimary} disabled={submittingCta}>
                  <Calendar size={20} /> Marcar Reunião com Especialista
                </button>
                <div className={styles.ctaSecondaries}>
                  <button onClick={() => handleCtaChoice('telefone')} className={styles.ctaSecondary} disabled={submittingCta}>
                    <Phone size={16} /> Prefiro contato por telefone
                  </button>
                  <button onClick={() => handleCtaChoice('whatsapp')} className={styles.ctaSecondary} disabled={submittingCta}>
                    <MessageSquare size={16} /> Prefiro contato por WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* Schedule Picker — Calendário Real */}
            {ctaStep === 'schedule' && (
              <div className={styles.schedulePicker}>
                <h3 className={styles.scheduleTitle}><Calendar size={18} /> Escolha uma data e horário</h3>

                {/* Carrossel de datas */}
                <p className={styles.scheduleLabel}>Selecione o dia:</p>
                <div className={styles.dateCarousel}>
                  {AVAILABLE_DATES.map((date, i) => {
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    return (
                      <button
                        key={i}
                        onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                        className={`${styles.dateCard} ${isSelected ? styles.dateCardActive : ''}`}
                      >
                        <span className={styles.dateCardWeekday}>{SHORT_WEEKDAY[date.getDay()]}</span>
                        <span className={styles.dateCardDay}>{date.getDate()}</span>
                        <span className={styles.dateCardMonth}>{SHORT_MONTH[date.getMonth()]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Horários disponíveis para o dia selecionado */}
                {selectedDate && JS_DAY_TO_SCHEDULE[selectedDate.getDay()] && (
                  <>
                    <p className={styles.scheduleLabel}>Horários disponíveis ({JS_DAY_TO_SCHEDULE[selectedDate.getDay()]}):</p>
                    <div className={styles.timeGrid}>
                      {getFilteredSchedule(selectedDate).map(t => (
                        <button 
                          key={t} 
                          onClick={() => setSelectedTime(t)}
                          className={`${styles.timeSlot} ${selectedTime === t ? styles.timeSlotSelected : ''}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {selectedTime && selectedDate && (
                  <div className={styles.scheduleConfirm}>
                    <p className={styles.scheduleSelected}>
                      <CheckCircle size={16} />
                      {selectedDate.getDate().toString().padStart(2,'0')}/{(selectedDate.getMonth()+1).toString().padStart(2,'0')}/{selectedDate.getFullYear()} às {selectedTime}
                    </p>
                    <button onClick={handleScheduleConfirm} className={styles.ctaPrimary} disabled={submittingCta}>
                      {submittingCta ? 'Confirmando...' : 'Confirmar Reunião'} <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Success Screen */}
            {ctaStep === 'success' && (
              <div className={styles.successCard}>
                <Image src={logo} alt="StartMedia Logo" className={styles.successLogo} />
                <CheckCircle size={48} className={styles.successIcon} />
                {ctaType === 'reuniao' ? (
                  <>
                    <h3>Este é o primeiro passo para o sucesso do seu negócio! 🚀</h3>
                    <p>Sua reunião foi confirmada. Enviamos os detalhes para <strong>{lead.email}</strong>. Nosso especialista entrará em contato com o link da reunião em breve.</p>
                  </>
                ) : ctaType === 'telefone' ? (
                  <>
                    <h3>Recebemos sua solicitação! 📞</h3>
                    <p>Alguém da nossa equipe técnica entrará em contato <strong>por telefone em até 24 horas</strong>, em horário comercial.</p>
                  </>
                ) : (
                  <>
                    <h3>Recebemos sua solicitação! 💬</h3>
                    <p>Alguém da nossa equipe técnica entrará em contato <strong>pelo WhatsApp em até 24 horas</strong>, em horário comercial.</p>
                  </>
                )}
                <a href="/" className={styles.backHome}>
                  Voltar à página inicial <ArrowRight size={16} />
                </a>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
