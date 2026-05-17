import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { nome, email, whatsapp, historico, diagnosticoFinal, ctaEscolhido, dataReuniao } = await req.json();

    if (!nome || !email || !whatsapp) {
      return NextResponse.json({ error: 'Dados de contato incompletos.' }, { status: 400 });
    }

    const tarefas = [];

    // 1. Salvar no Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('[Supabase] Tentando salvar lead:', { email, ctaEscolhido });
      const { error: dbError } = await supabase.from('leads').insert([
        {
          nome,
          email,
          whatsapp,
          respostas_raw: historico,
          diagnostico_gerado: diagnosticoFinal,
          cta_escolhido: ctaEscolhido || 'nenhum',
          data_reuniao: dataReuniao || null,
          link_meet: null
        }
      ]);
      
      if (dbError) {
        console.error('[Supabase Error]', dbError);
      } else {
        console.log('[Supabase] Lead salvo com sucesso.');
      }
    }

    // 2. Envio de e-mails
    if (process.env.RESEND_API_KEY) {
      console.log('[Resend] Preparando envio do e-mail de diagnóstico. CTA:', ctaEscolhido);
      
      const ctaLabel = {
        reuniao: '📅 REUNIÃO AGENDADA',
        telefone: '📞 LEAD AGUARDANDO CONTATO POR TELEFONE',
        whatsapp: '🟢 LEAD ENTROU EM CONTATO VIA WHATSAPP',
        nenhum: '📋 NOVO LEAD DIAGNOSTICADO'
      }[ctaEscolhido] || '📋 NOVO LEAD DIAGNOSTICADO';

      const justificativasHtml = diagnosticoFinal?.justificativas
        ?.map(j => `
          <div style="background:#121212;border-left:4px solid #00FF85;padding:16px;margin-bottom:16px;border-radius:6px;border:1px solid #1a1a1a;">
            <strong style="color:#00FF85;font-size:16px;display:block;margin-bottom:6px;">${j.servico}</strong>
            <p style="color:#e0e0e0;margin:0 0 10px 0;line-height:1.5;font-size:14px;">${j.razao}</p>
            ${j.estatistica ? `
              <div style="background:#0a0a0a;padding:10px 14px;border-radius:4px;border:1px solid #1a1a1a;margin-top:8px;">
                <span style="color:#888;font-size:12px;display:block;margin-bottom:2px;">Estatística / Justificativa de Mercado:</span>
                <span style="color:#00FF85;font-size:13px;font-style:italic;line-height:1.4;">"${j.estatistica}"</span>
                ${j.fonte ? `<span style="color:#666;font-size:11px;display:block;margin-top:4px;">Fonte: ${j.fonte}</span>` : ''}
              </div>
            ` : ''}
          </div>
        `).join('') || '<p style="color:#666;font-style:italic;">Nenhum serviço mapeado (Contato Direto)</p>';

      const reuniaoInfo = ctaEscolhido === 'reuniao' && dataReuniao
        ? `<div style="background:#002915;padding:18px;border-radius:8px;margin:20px 0;text-align:center;border:1px solid #005c30;">
            <strong style="color:#00FF85;font-size:18px;display:block;">📅 Consultoria Agendada com Sucesso</strong>
            <span style="color:#f0f0f0;font-size:16px;display:block;margin-top:6px;">${dataReuniao}</span>
           </div>`
        : '';

      // ── E-mail Completo de Diagnóstico para Reenvio Manual ────────────────────
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;background:#080808;padding:32px;color:#f0f0f0;max-width:650px;margin:0 auto;border-radius:12px;border:1px solid #1a1a1a;">
          
          <!-- Cabeçalho -->
          <div style="text-align:center;margin-bottom:24px;border-bottom:1px solid #1a1a1a;padding-bottom:20px;">
            <h1 style="color:#00FF85;margin:0;font-size:24px;letter-spacing:1px;">STARTMEDIA DIGITAL</h1>
            <p style="color:#888;margin:6px 0 0 0;font-size:12px;">RELATÓRIO DE NOVO LEAD E DIAGNÓSTICO DIGITAL</p>
          </div>

          <!-- Status do Lead / CTA -->
          <div style="text-align:center;margin-bottom:24px;">
            <span style="background:#00FF85;color:#080808;padding:8px 20px;border-radius:30px;font-weight:bold;font-size:13px;display:inline-block;text-transform:uppercase;">
              ${ctaLabel}
            </span>
          </div>

          <!-- Tabela de Contatos -->
          <h3 style="color:#00FF85;margin-bottom:12px;font-size:16px;border-bottom:1px solid #2c2c2c;padding-bottom:6px;">👤 Dados de Contato do Lead</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:10px 0;color:#aaa;width:120px;font-size:14px;">Nome</td><td style="padding:10px 0;color:#f0f0f0;font-weight:bold;font-size:14px;">${nome}</td></tr>
            <tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:10px 0;color:#aaa;font-size:14px;">E-mail</td><td style="padding:10px 0;color:#00FF85;font-size:14px;"><a href="mailto:${email}" style="color:#00FF85;text-decoration:none;">${email}</a></td></tr>
            <tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:10px 0;color:#aaa;font-size:14px;">WhatsApp</td><td style="padding:10px 0;color:#f0f0f0;font-size:14px;">${whatsapp}</td></tr>
          </table>

          ${reuniaoInfo}

          <!-- Diagnóstico IA -->
          <h3 style="color:#00FF85;margin-top:28px;margin-bottom:12px;font-size:16px;border-bottom:1px solid #2c2c2c;padding-bottom:6px;">📋 1. Análise Geral de Maturidade Digital</h3>
          <div style="color:#e0e0e0;line-height:1.6;background:#121212;padding:18px;border-radius:8px;border:1px solid #1a1a1a;margin-bottom:24px;font-size:14px;">
            ${diagnosticoFinal?.pergunta || 'Contato direto sem diagnóstico gerado no chat.'}
          </div>

          <!-- Serviços Recomendados -->
          <h3 style="color:#00FF85;margin-top:28px;margin-bottom:12px;font-size:16px;border-bottom:1px solid #2c2c2c;padding-bottom:6px;">🛠️ 2. Serviços Recomendados & Justificativas</h3>
          <div style="margin-bottom:24px;">
            ${justificativasHtml}
          </div>

          <!-- Faixa de Investimento -->
          <h3 style="color:#00FF85;margin-top:28px;margin-bottom:12px;font-size:16px;border-bottom:1px solid #2c2c2c;padding-bottom:6px;">💰 3. Estimativa de Investimento Sugerida</h3>
          <div style="background:#121212;padding:18px;border-radius:8px;border:1px solid #1a1a1a;margin-bottom:24px;">
            <div style="font-size:20px;font-weight:bold;color:#00FF85;margin-bottom:8px;">
              ${diagnosticoFinal?.estimativaInvestimento || 'A definir sob consulta'}
            </div>
            <p style="color:#888;font-size:12px;margin:0;line-height:1.5;">
              <em>${diagnosticoFinal?.disclaimerOrcamento || 'Nota: Os valores são estimativas e podem variar conforme o escopo final.'}</em>
            </p>
          </div>

        </div>
      `;

      // ── DIRECIONAMENTO DO E-MAIL DE ALERTA ──────────────────────────────────
      // Como a nova conta do Resend foi criada diretamente sob o e-mail 'contato@startmediadigital.com.br',
      // ele é o proprietário verificado padrão. Enviamos direto para ele sem nenhuma restrição de Sandbox!
      const targetEmails = ['contato@startmediadigital.com.br'];

      console.log('[Resend] Enviando relatório de diagnóstico direto para contato@startmediadigital.com.br.');

      tarefas.push(
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: targetEmails,
          subject: `${ctaLabel} — ${nome} (Diagnóstico Completo)`,
          html: emailHtml
        })
        .then(r => console.log('[Resend] Relatório de diagnóstico enviado:', r))
        .catch(e => console.error('[Resend Error Relatório]', e))
      );
    }

    await Promise.all(tarefas);

    return NextResponse.json({ success: true, message: 'Diagnóstico finalizado com sucesso!' });

  } catch (error) {
    console.error('Erro na API Final:', error);
    return NextResponse.json({ error: 'Erro ao salvar os dados finais.' }, { status: 500 });
  }
}
