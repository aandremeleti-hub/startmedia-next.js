import { NextResponse } from 'next/server';
import { systemPrompt } from '@/lib/systemPrompt';
import { GoogleGenAI } from '@google/genai';

// ── SKILL: prompt-optimizer ────────────────────────────────────────────────────
// Constrói o array de conteúdos para o Gemini garantindo alternância estrita
// entre 'user' e 'model'. NÃO injeta instruções de diagnóstico final aqui —
// isso é responsabilidade exclusiva do schema e do systemPrompt.
function buildGeminiPayload(history, userMessage) {
  const contents = [];

  // Mapeia o histórico do frontend para o formato do Gemini
  if (history && history.length > 0) {
    // O SDK/API do Gemini exige que o histórico de conversação inicie sempre com o usuário
    if (history[0].role === 'assistant') {
      contents.push({ role: 'user', parts: [{ text: 'Olá, gostaria de iniciar o diagnóstico digital da minha empresa.' }] });
    }

    history.forEach(msg => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        // Concatena se a última mensagem é do mesmo papel (evita erro de roles consecutivos)
        contents[contents.length - 1].parts[0].text += `\n\n${msg.content}`;
      } else {
        contents.push({ role, parts: [{ text: msg.content }] });
      }
    });
  }

  // Adiciona a mensagem atual do usuário
  if (userMessage) {
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n\n${userMessage}`;
    } else {
      contents.push({ role: 'user', parts: [{ text: userMessage }] });
    }
  }

  return contents;
}

// ── SKILL: nodejs-best-practices (Structured Outputs dinâmicos) ───────────────
// quizSchema: leve e rápido (~2s). Usado nas perguntas intermediárias do quiz.
const quizSchema = {
  type: 'OBJECT',
  properties: {
    isFinal:            { type: 'BOOLEAN' },
    encerradoPorOfensa: { type: 'BOOLEAN' },
    perguntaNumero:     { type: 'INTEGER' },
    pergunta:           { type: 'STRING' },
    tipo:               { type: 'STRING' },
    opcoes:             { type: 'ARRAY', items: { type: 'STRING' } },
    dadoPesquisa: {
      type: 'OBJECT',
      nullable: true,
      properties: {
        estatistica: { type: 'STRING' },
        fonte:       { type: 'STRING' },
        link:        { type: 'STRING', nullable: true },
        contexto:    { type: 'STRING' },
      },
    },
  },
  required: ['isFinal', 'encerradoPorOfensa', 'perguntaNumero', 'pergunta', 'tipo', 'opcoes'],
};

// finalSchema: completo. Usado APENAS quando o histórico indica turno final.
const finalSchema = {
  type: 'OBJECT',
  properties: {
    isFinal:            { type: 'BOOLEAN' },
    encerradoPorOfensa: { type: 'BOOLEAN' },
    perguntaNumero:     { type: 'INTEGER' },
    pergunta:           { type: 'STRING' },
    tipo:               { type: 'STRING' },
    opcoes:             { type: 'ARRAY', items: { type: 'STRING' } },
    dadoPesquisa: {
      type: 'OBJECT',
      nullable: true,
      properties: {
        estatistica: { type: 'STRING' },
        fonte:       { type: 'STRING' },
        link:        { type: 'STRING', nullable: true },
        contexto:    { type: 'STRING' },
      },
    },
    servicosRecomendados: { type: 'ARRAY', items: { type: 'STRING' } },
    justificativas: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          servico:    { type: 'STRING' },
          razao:      { type: 'STRING' },
          estatistica:{ type: 'STRING' },
          fonte:      { type: 'STRING' },
          link:       { type: 'STRING', nullable: true },
        },
      },
    },
    estimativaInvestimento: { type: 'STRING' },
    disclaimerOrcamento:    { type: 'STRING' },
  },
  required: [
    'isFinal', 'encerradoPorOfensa', 'pergunta', 'tipo',
    'servicosRecomendados', 'justificativas',
    'estimativaInvestimento', 'disclaimerOrcamento',
  ],
};

export async function POST(req) {
  try {
    const { history, userMessage } = await req.json();

    // ── SKIP: Bypass estático da primeira pergunta ─────────────────────────────
    // Sem histórico = início do chat. Resposta instantânea, sem consumir tokens.
    if (!history || history.length === 0) {
      return NextResponse.json({
        isFinal: false,
        encerradoPorOfensa: false,
        perguntaNumero: 1,
        pergunta:
          'Olá! Sou o agente de diagnóstico digital da STARTMEDIA. Vou fazer algumas perguntas rápidas para entender a situação atual do seu negócio e identificar exatamente onde você pode crescer mais. São no máximo 8 perguntas — e ao final, você recebe um diagnóstico completo com os serviços que mais fazem sentido para o seu caso, além de uma estimativa de investimento.\n\nCuriosidade: este agente que você está usando agora é um exemplo real do que a STARTMEDIA pode criar e integrar de forma personalizada para a sua empresa. 😉\n\nPara começarmos: qual é o seu principal objetivo comercial com a presença digital da sua empresa hoje?',
        tipo: 'selecao',
        opcoes: [
          'Aumentar Vendas e Atrair Leads qualificados',
          'Automatizar o Atendimento e Agendas via WhatsApp/Site',
          'Criar ou Modernizar o meu Site / Landing Page',
          'Investir em Tráfego Pago (Anúncios no Google/Meta)',
          'Outro',
        ],
        dadoPesquisa: {
          estatistica:
            'Empresas que estruturam processos de vendas digitais e automação de atendimento inteligente crescem até 3.2 vezes mais rápido.',
          fonte: 'McKinsey & Company',
          link: null,
          contexto:
            'Definir um objetivo comercial claro permite alinhar seus canais de atração de tráfego com ferramentas de conversão automática.',
        },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key do Gemini não configurada.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Seleciona schema com base na quantidade de mensagens do histórico.
    // Histórico com 10+ entradas = turno 5 ou além → pode ser o diagnóstico final.
    const isFinalTurn = history.length >= 10;
    const responseSchema = isFinalTurn ? finalSchema : quizSchema;

    const contents = buildGeminiPayload(history, userMessage);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text;

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(rawText);
      } catch {
        // Fallback: extrai JSON se o modelo adicionou texto fora
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            jsonResponse = JSON.parse(jsonMatch[0]);
          } catch {
            throw new Error('Falha crítica ao parsear o JSON extraído da resposta.');
          }
        } else {
          throw new Error('A IA não retornou um formato JSON reconhecível na resposta.');
        }
      }

      // ── Guarda de segurança para o diagnóstico final ───────────────────────
      // Se isFinal:true mas campos essenciais chegaram vazios → retry focado.
      if (
        jsonResponse.isFinal &&
        (!jsonResponse.servicosRecomendados?.some(s => s?.trim?.().length > 0) ||
          !jsonResponse.estimativaInvestimento?.trim?.().length)
      ) {
        console.warn('[Diagnóstico Final] Campos vazios — acionando retry...');

        const retryContents = [
          ...contents,
          {
            role: 'model',
            parts: [{ text: JSON.stringify({ isFinal: true, pergunta: jsonResponse.pergunta || 'Diagnóstico gerado.' }) }],
          },
          {
            role: 'user',
            parts: [{
              text:
                'Gere agora o JSON final COMPLETO com isFinal:true e todos os campos preenchidos: ' +
                'servicosRecomendados (2-4 serviços), justificativas (objetos completos com servico/razao/estatistica/fonte/link), ' +
                'estimativaInvestimento (R$/mês) e disclaimerOrcamento. ' +
                'OBRIGATÓRIO: arrays e strings devem ter conteúdo real baseado na conversa.',
            }],
          },
        ];

        const retryResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: retryContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        });

        try {
          jsonResponse = JSON.parse(retryResponse.text);
        } catch {
          console.error('[Retry Parse Error] Mantendo resposta original.');
        }
      }

      return NextResponse.json(jsonResponse);

    } catch (apiError) {
      console.error('[Gemini API Error]', {
        message: apiError.message,
        name: apiError.name,
      });

      let status = 500;
      let userFriendlyMessage = 'Erro ao processar o diagnóstico. Tente novamente.';

      if (apiError.message?.includes('429')) {
        status = 429;
        userFriendlyMessage = 'O serviço está temporariamente sobrecarregado. Tente novamente em alguns segundos.';
      } else if (apiError.message?.includes('401') || apiError.message?.includes('API_KEY_INVALID')) {
        status = 401;
        userFriendlyMessage = 'Erro de autenticação com o provedor de IA. Verifique as configurações.';
      } else if (apiError.message?.includes('SAFETY')) {
        status = 400;
        userFriendlyMessage = 'O conteúdo foi bloqueado pelos filtros de segurança.';
      } else if (apiError.message?.includes('404')) {
        status = 404;
        userFriendlyMessage = 'Modelo de IA não encontrado ou descontinuado.';
      }

      return NextResponse.json({ error: userFriendlyMessage }, { status });
    }

  } catch (error) {
    console.error('[API Handler Critical Error]', error);
    return NextResponse.json({ error: 'Erro interno ao processar o diagnóstico.' }, { status: 500 });
  }
}
