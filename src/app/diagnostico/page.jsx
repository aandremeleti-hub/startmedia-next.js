'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './style.module.css';
import { Send, Loader2, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import logo from '../../assets/images/home/logo.svg';
import Image from 'next/image';

export default function DiagnosticoPage() {
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalResult, setFinalResult] = useState(null);
  const [inputValue, setInputValue] = useState('');
  
  // Dados do lead
  const [lead, setLead] = useState({ nome: '', email: '', whatsapp: '' });
  const [step, setStep] = useState('lead'); // 'lead', 'quiz', 'result'
  const [submittingLead, setSubmittingLead] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (step === 'quiz') {
      scrollToBottom();
    }
  }, [history, currentQuestion, step]);

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    if (!lead.nome || !lead.email || !lead.whatsapp) return;
    setStep('quiz');
    await fetchNextQuestion();
  };

  const fetchNextQuestion = async (userAnswer = '') => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: history,
          userMessage: userAnswer ? `Minha resposta: ${userAnswer}` : 'Inicie o diagnóstico. Qual é a sua primeira pergunta?'
        })
      });

      if (!response.ok) throw new Error('Falha na comunicação com a IA');
      
      const data = await response.json();
      
      if (data.isFinal) {
        setFinalResult(data);
        setStep('result');
        // Salva silenciosamente e envia e-mail
        await fetch('/api/diagnostico-final', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: lead.nome,
            email: lead.email,
            whatsapp: lead.whatsapp,
            historico: history,
            diagnosticoFinal: data
          })
        });
      } else {
        setCurrentQuestion(data);
      }
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() && !e) return;
    
    const answerToSubmit = inputValue.trim();
    
    // Atualiza histórico na tela
    const newHistory = [
      ...history,
      { role: 'assistant', content: currentQuestion.pergunta },
      { role: 'user', content: answerToSubmit }
    ];
    
    setHistory(newHistory);
    setCurrentQuestion(null);
    setInputValue('');
    
    await fetchNextQuestion(answerToSubmit);
  };

  const handleChipSelect = async (opcao) => {
    // Atualiza histórico na tela
    const newHistory = [
      ...history,
      { role: 'assistant', content: currentQuestion.pergunta },
      { role: 'user', content: opcao }
    ];
    
    setHistory(newHistory);
    setCurrentQuestion(null);
    
    await fetchNextQuestion(opcao);
  };

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Etapa 1: Captura de Lead */}
        {step === 'lead' && (
          <div className={styles.card}>
            <Image src={logo} alt="StartMedia Logo" className={styles.cardLogo} />
            <div className={styles.header}>
              <Sparkles className={styles.iconGlow} size={32} />
              <h1 className={styles.title}>Diagnóstico Digital</h1>
              <p className={styles.subtitle}>Descubra o potencial do seu negócio com a nossa IA.</p>
            </div>
            
            <form onSubmit={handleStartQuiz} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="nome">Como devemos te chamar?</label>
                <input 
                  id="nome"
                  type="text" 
                  value={lead.nome}
                  onChange={(e) => setLead({ ...lead, nome: e.target.value })}
                  placeholder="Seu nome ou da empresa"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="whatsapp">Qual o seu melhor WhatsApp?</label>
                <input 
                  id="whatsapp"
                  type="tel" 
                  value={lead.whatsapp}
                  onChange={(e) => setLead({ ...lead, whatsapp: e.target.value })}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="email">E o seu E-mail profissional?</label>
                <input 
                  id="email"
                  type="email" 
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  placeholder="contato@suaempresa.com.br"
                  required
                />
              </div>
              
              <button type="submit" className={styles.primaryButton}>
                Iniciar Diagnóstico <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {/* Etapa 2: Quiz IA */}
        {step === 'quiz' && (
          <div className={styles.chatContainer}>
            <Image src={logo} alt="StartMedia Logo" className={styles.cardLogo} />
            <div className={styles.chatHeader}>
              <Sparkles size={24} className={styles.iconGlow} />
              <h2>STARTMEDIA IA</h2>
            </div>
            
            <div className={styles.messagesArea}>
              {history.map((msg, index) => (
                <div key={index} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
                  {msg.content}
                </div>
              ))}
              
              {loading && (
                <div className={`${styles.message} ${styles.aiMessage} ${styles.loadingMessage}`}>
                  <Loader2 className={styles.spin} size={20} />
                  <span>Analisando e gerando pergunta...</span>
                </div>
              )}

              {!loading && currentQuestion && (
                <div className={`${styles.message} ${styles.aiMessage} ${styles.appearAnimation}`}>
                  <p>{currentQuestion.pergunta}</p>
                  
                  {currentQuestion.tipo === 'chips' || currentQuestion.tipo === 'selecao' ? (
                    <div className={styles.chipOptions}>
                      {currentQuestion.opcoes?.map((opcao, i) => (
                        <button key={i} onClick={() => handleChipSelect(opcao)} className={styles.chipButton}>
                          {opcao}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {currentQuestion && currentQuestion.tipo !== 'chips' && currentQuestion.tipo !== 'selecao' && (
              <form onSubmit={handleAnswerSubmit} className={styles.inputArea}>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  className={styles.chatInput}
                  autoFocus
                />
                <button type="submit" className={styles.sendButton} disabled={!inputValue.trim()}>
                  <Send size={20} />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Etapa 3: Resultado Final */}
        {step === 'result' && finalResult && (
          <div className={styles.resultCard}>
            <Image src={logo} alt="StartMedia Logo" className={styles.cardLogo} />
            <div className={styles.resultHeader}>
              <CheckCircle size={48} className={styles.successIcon} />
              <h1>Seu Diagnóstico está Pronto!</h1>
              <p>Analisamos seu perfil e estruturamos um plano de ação para escalar os seus resultados.</p>
            </div>
            
            <div className={styles.resultContent}>
              <div className={styles.resultSection}>
                <h3>O que descobrimos:</h3>
                <p>{finalResult.pergunta}</p>
              </div>

              <div className={styles.resultSection}>
                <h3>Serviços Recomendados para Você:</h3>
                <ul className={styles.serviceList}>
                  {finalResult.servicosRecomendados?.map((servico, i) => (
                    <li key={i}><Sparkles size={16} /> {servico}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.resultSection}>
                <h3>Por que investir nisso?</h3>
                <p className={styles.justification}>{finalResult.justificativa}</p>
              </div>

              <div className={styles.resultSection}>
                <h3>Investimento Estimado:</h3>
                <p className={styles.investment}>{finalResult.estimativaInvestimento}</p>
              </div>
            </div>

            <a 
              href="https://wa.me/5511950803544" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.ctaButton}
            >
              Falar com um Especialista <ArrowRight size={20} />
            </a>
          </div>
        )}

      </div>
    </main>
  );
}
