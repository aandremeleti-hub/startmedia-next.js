import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { nome, email, whatsapp, historico, diagnosticoFinal, ctaEscolhido, dataReuniao, linkMeet } = await req.json();

    if (!nome || !email || !whatsapp) {
      return NextResponse.json({ error: 'Dados de contato incompletos.' }, { status: 400 });
    }

    const tarefas = [];

    // 1. Salvar no Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const saveToDatabase = supabase.from('leads').insert([
        {
          nome,
          email,
          whatsapp,
          respostas_raw: historico,
          diagnostico_gerado: diagnosticoFinal,
          cta_escolhido: ctaEscolhido || 'nenhum',
          data_reuniao: dataReuniao || null,
          link_meet: linkMeet || null
        }
      ]);
      tarefas.push(saveToDatabase);
    }

    // 2. Enviar E-mail via Resend (para a StartMedia)
    if (process.env.RESEND_API_KEY) {
      const ctaLabel = {
        reuniao: '📅 REUNIÃO AGENDADA',
        telefone: '📞 LEAD AGUARDANDO CONTATO POR TELEFONE EM ATÉ 24H',
        whatsapp: '💬 LEAD AGUARDANDO CONTATO POR WHATSAPP EM ATÉ 24H',
        nenhum: '📋 NOVO LEAD DIAGNOSTICADO'
      }[ctaEscolhido] || '📋 NOVO LEAD DIAGNOSTICADO';

      const servicosHtml = diagnosticoFinal?.servicosRecomendados
        ?.map(s => `<li style="margin-bottom:8px;">${s}</li>`)
        .join('') || '<li>Não disponível</li>';

      const justificativasHtml = diagnosticoFinal?.justificativas
        ?.map(j => `
          <div style="background:#1a1a1a;border-left:3px solid #00FF85;padding:12px 16px;margin-bottom:12px;border-radius:6px;">
            <strong style="color:#00FF85;">${j.servico}</strong>
            <p style="color:#f0f0f0;margin:6px 0;">${j.razao}</p>
            <p style="color:#aaa;font-size:12px;">📊 ${j.estatistica} — <em>${j.fonte}</em>${j.link ? ` (<a href="${j.link}" style="color:#00FF85;">ver fonte</a>)` : ''}</p>
          </div>
        `).join('') || '';

      const reuniaoInfo = ctaEscolhido === 'reuniao' && dataReuniao
        ? `<div style="background:#003D20;padding:16px;border-radius:8px;margin:16px 0;text-align:center;">
            <strong style="color:#00FF85;font-size:18px;">📅 Reunião: ${dataReuniao}</strong>
            ${linkMeet ? `<br/><a href="${linkMeet}" style="color:#00FF85;">${linkMeet}</a>` : ''}
           </div>`
        : '';

      const emailHtml = `
        <div style="font-family:Arial,sans-serif;background:#080808;padding:32px;color:#f0f0f0;max-width:600px;margin:0 auto;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="background:#00FF85;color:#080808;padding:6px 16px;border-radius:20px;font-weight:bold;font-size:14px;">${ctaLabel}</span>
          </div>

          <h2 style="color:#00FF85;border-bottom:1px solid #2C2C2C;padding-bottom:12px;">Novo Lead — STARTMEDIA DIGITAL</h2>

          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;color:#aaa;">Nome</td><td style="padding:8px;color:#f0f0f0;font-weight:bold;">${nome}</td></tr>
            <tr style="background:#1a1a1a;"><td style="padding:8px;color:#aaa;">E-mail</td><td style="padding:8px;color:#f0f0f0;">${email}</td></tr>
            <tr><td style="padding:8px;color:#aaa;">WhatsApp</td><td style="padding:8px;color:#f0f0f0;">${whatsapp}</td></tr>
          </table>

          ${reuniaoInfo}

          <h3 style="color:#00FF85;margin-top:24px;">📋 Diagnóstico Gerado:</h3>
          <p style="color:#d0d0d0;line-height:1.6;background:#1a1a1a;padding:16px;border-radius:8px;">${diagnosticoFinal?.pergunta || 'Não disponível'}</p>

          <h3 style="color:#00FF85;margin-top:24px;">⚡ Serviços Recomendados:</h3>
          <ul style="color:#f0f0f0;padding-left:20px;">${servicosHtml}</ul>

          <h3 style="color:#00FF85;margin-top:24px;">📊 Justificativas com Dados:</h3>
          ${justificativasHtml}

          <div style="background:#1a1a1a;border:1px solid #2C2C2C;padding:12px 16px;border-radius:8px;margin-top:16px;">
            <strong style="color:#00FF85;">💰 Estimativa de Investimento:</strong>
            <p style="color:#f0f0f0;margin:4px 0;">${diagnosticoFinal?.estimativaInvestimento || 'A definir'}</p>
          </div>

          <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #2C2C2C;">
            <p style="color:#666;font-size:12px;">STARTMEDIA DIGITAL — Sistema Automático de Diagnóstico</p>
          </div>
        </div>
      `;

      const sendEmail = resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: ['aandremeleti@gmail.com'],
        subject: `${ctaLabel} — ${nome} | STARTMEDIA`,
        html: emailHtml
      });
      tarefas.push(sendEmail);

      // 3. E-mail de confirmação para o lead
      const emailLeadHtml = `
        <div style="font-family:Arial,sans-serif;background:#080808;padding:32px;color:#f0f0f0;max-width:600px;margin:0 auto;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#00FF85;font-size:28px;margin:0;">STARTMEDIA DIGITAL</h1>
            <p style="color:#aaa;font-size:14px;">Estrutura digital que funciona de verdade</p>
          </div>

          <h2 style="color:#f0f0f0;">Olá, ${nome}! 👋</h2>

          ${ctaEscolhido === 'reuniao'
            ? `<p style="color:#d0d0d0;line-height:1.6;">Sua reunião foi confirmada para <strong style="color:#00FF85;">${dataReuniao}</strong>. Este é o primeiro passo para o sucesso do seu negócio!</p>
               ${linkMeet ? `<div style="text-align:center;margin:24px 0;"><a href="${linkMeet}" style="background:#00FF85;color:#080808;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Acessar Reunião no Google Meet</a></div>` : ''}
               <p style="color:#d0d0d0;">Nosso especialista já tem o seu diagnóstico em mãos e estará preparado para conversar sobre as melhores estratégias para o seu negócio.</p>`
            : ctaEscolhido === 'telefone'
            ? `<p style="color:#d0d0d0;line-height:1.6;">Recebemos sua solicitação! Nossa equipe entrará em contato com você <strong style="color:#00FF85;">por telefone em até 24 horas</strong>, em horário comercial.</p>`
            : `<p style="color:#d0d0d0;line-height:1.6;">Recebemos sua solicitação! Nossa equipe entrará em contato com você <strong style="color:#00FF85;">pelo WhatsApp em até 24 horas</strong>, em horário comercial.</p>`
          }

          <div style="background:#1a1a1a;border-left:3px solid #00FF85;padding:16px;border-radius:8px;margin:24px 0;">
            <p style="color:#aaa;font-size:13px;margin:0;">Seu diagnóstico ficará disponível na confirmação acima. Qualquer dúvida, fale com a gente pelo WhatsApp: <a href="https://wa.me/5511950803544" style="color:#00FF85;">+55 11 95080-3544</a></p>
          </div>

          <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #2C2C2C;">
            <p style="color:#666;font-size:12px;">© STARTMEDIA DIGITAL | startmediadigital.com.br</p>
          </div>
        </div>
      `;

      const sendEmailLead = resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [email],
        subject: ctaEscolhido === 'reuniao'
          ? `✅ Reunião Confirmada — STARTMEDIA DIGITAL`
          : `✅ Recebemos sua solicitação — STARTMEDIA DIGITAL`,
        html: emailLeadHtml
      });
      tarefas.push(sendEmailLead);
    }

    await Promise.all(tarefas);

    return NextResponse.json({ success: true, message: 'Diagnóstico finalizado com sucesso!' });

  } catch (error) {
    console.error('Erro na API Final:', error);
    return NextResponse.json({ error: 'Erro ao salvar os dados finais.' }, { status: 500 });
  }
}
