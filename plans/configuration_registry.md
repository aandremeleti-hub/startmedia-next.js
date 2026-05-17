# 📊 Registro de Configurações Técnicas & Blueprint — StartMedia

Este é o **registro técnico de segurança** do projeto. Ele mapeia de forma didática todas as integrações externas (Supabase, Gemini, Resend e Hostinger) e serve como fonte única de verdade (SSOT) para que você e os agentes de IA realizem manutenções seguras e sem erros de compatibilidade.

> [!IMPORTANT]
> **Segurança de Credenciais:** Nunca salve chaves privadas de API brutas (como `re_...` ou `AIza...`) neste arquivo de documentação, pois ele será rastreado pelo Git. Mapeie apenas as chaves exigidas e consulte o arquivo local e privado [.env.local](file:///c:/Users/Andre/Documents/André/Antigravity/startmedia_nextjs/.env.local) para os valores reais.

---

## 🔐 1. Variáveis de Ambiente (`.env.local`)

O arquivo [.env.local](file:///c:/Users/Andre/Documents/André/Antigravity/startmedia_nextjs/.env.local) carrega as credenciais e parâmetros das conexões na inicialização do servidor Next.js. 

Abaixo está o mapa das variáveis necessárias:

| Variável | Serviço | Função Técnica | Onde obter o valor |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Generative AI | Autenticação no SDK do Gemini para gerar as conversas e o diagnóstico final. | Google AI Studio (Console Developer) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Database | Link da API pública do banco de dados para salvar as informações dos leads. | Painel Supabase -> Project Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Database | Chave anônima pública para autorizar inserções de leads a partir do backend. | Painel Supabase -> Project Settings -> API |
| `RESEND_API_KEY` | Resend E-mails | Token de autorização para o disparo automático de e-mails via API do Resend. | Painel Resend -> API Keys |
| `RESEND_FROM_EMAIL` | Resend E-mails | Remetente oficial que os clientes verão ao receber o e-mail (Ex: `"StartMedia <contato@startmediadigital.com.br>"`). | **Após verificação DNS no painel Hostinger** |

---

## 🗄️ 2. Estrutura do Banco de Dados (Supabase)

Quando o cliente finaliza o diagnóstico ou preenche o formulário de contato, os dados são salvos na tabela `leads` no Supabase.

* **Nome da Tabela no Banco:** `leads`
* **Localização do Código de Inserção:** [src/app/api/diagnostico-final/route.js](file:///c:/Users/Andre/Documents/André/Antigravity/startmedia_nextjs/src/app/api/diagnostico-final/route.js)

### 📋 Mapeamento de Colunas (Schema)

| Nome da Coluna | Tipo de Dado (SQL) | Descrição do Conteúdo | Exemplo de Valor |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` (Auto-incremento) | Chave primária da tabela. | `12` |
| `created_at` | `timestamp with time zone` | Data e hora automática da criação do lead. | `2026-05-16 22:00:00+00` |
| `nome` | `text` | Nome completo inserido pelo lead. | `"João da Silva"` |
| `email` | `text` | E-mail profissional informado pelo lead. | `"joao@empresa.com"` |
| `whatsapp` | `text` | Número de WhatsApp com máscara aplicada. | `"(11) 98765-4321"` |
| `respostas_raw` | `json` ou `text` | O histórico completo da conversa do quiz (perguntas e respostas). | `[{"role": "user", "content": "..."}]` |
| `diagnostico_gerado` | `json` ou `text` | O diagnóstico final estruturado gerado pela IA. | `{"servicosRecomendados": [...], "justificativas": [...]}` |
| `cta_escolhido` | `text` | A ação final que o lead escolheu. | `"reuniao"`, `"whatsapp"`, `"telefone"` ou `"nenhum"` |
| `data_reuniao` | `text` (ou null) | Data e hora escolhida para reunião de consultoria. | `"28/05/2026 (Quinta) às 14:00"` |
| `link_meet` | `text` (ou null) | Link da sala do Google Meet para a reunião (gerado depois). | `null` |

---

## 🤖 3. Inteligência Artificial (Google Gemini SDK)

A StartMedia utiliza o SDK oficial do Google para interações rápidas e seguras.

* **SDK Instalado:** `@google/genai` (versão estável `^2.0.1`)
* **Modelo Utilizado:** `gemini-3.1-flash-lite` (ideal pela extrema velocidade de resposta, suporte a *Structured Outputs* e custo-benefício de leads).
* **Estrutura de Entrada/Saída:** Exige obrigatoriamente a alternância estrita entre turnos (`user` e `model`) para evitar erros 400 de histórico corrompido.
* **Arquivo de Instruções de Personalidade:** [src/lib/systemPrompt.js](file:///c:/Users/Andre/Documents/André/Antigravity/startmedia_nextjs/src/lib/systemPrompt.js) (contém a identidade de marca e regras de conversação da StartMedia).

---

## 📧 4. Envio de E-mails (Resend + Hostinger DNS)

Para habilitar o envio profissional do remetente `contato@startmediadigital.com.br` para qualquer destinatário da internet, você precisa configurar os registros DNS no seu painel da Hostinger.

### 📋 Fluxo de Verificação no Resend + Hostinger
1. Faça login na sua conta do [Resend](https://resend.com).
2. Vá em **Domains** -> **Add Domain** -> Insira `startmediadigital.com.br`.
3. O Resend exibirá **3 registros do tipo TXT e MX**.
4. Faça login no painel da **Hostinger** -> Vá em **Domínios** -> Escolha `startmediadigital.com.br` -> Clique em **Editor de Zona DNS**.
5. Crie os registros exatamente conforme a tabela gerada no Resend.

### ✍️ Exemplo das Chaves DNS que você inserirá na Hostinger:

| Tipo (Type) | Nome (Host) | Valor (Points to / Value) | Propósito |
| :--- | :--- | :--- | :--- |
| **TXT** | `resend._domainkey` | `k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...` | **DKIM Key:** Assinatura digital que prova que a StartMedia autorizou o Resend. |
| **TXT** | `@` ou em branco | `v=spf1 include:feedback-smtp.us-east-1.amazonses.com ~all` | **SPF Record:** Autorização de servidores de e-mail autorizados a enviar mensagens pelo domínio. |
| **MX** | `feedback` | `10 inbound-smtp.us-east-1.amazonaws.com.` | **MX Record:** Permite o recebimento de e-mails e feedbacks de entrega. |

*(Nota: Os valores exatos acima são gerados unicamente dentro do painel da sua conta do Resend ao adicionar o domínio).*

---

## 🛠️ 5. Fluxo Homologado de E-mails (Totalmente Manual para o Cliente)

Conforme decisão de design do proprietário, o fluxo foi simplificado para garantir controle total sobre a comunicação comercial, eliminando disparos automáticos para o cliente e centralizando o relatório detalhado no e-mail interno:

### 📥 1. E-mail Enviado ao Cliente (`email` do Lead)
* **Status:** **DESATIVADO (Totalmente Manual).** Nenhum e-mail automático é disparado para o cliente para preservar um contato humano personalizado.

### 📤 2. E-mail de Relatório Completo & Alerta (Para a StartMedia)
* **Remetentes e Destinatários:**
  * **Modo Sandbox (Desenvolvimento):** Como a nova conta do Resend foi criada diretamente com o e-mail `contato@startmediadigital.com.br`, o e-mail de diagnóstico de testes é enviado com sucesso de `onboarding@resend.dev` direto para `contato@startmediadigital.com.br`, sem nenhuma restrição ou bloqueio de sandbox.
  * **Modo Produção:** Assim que o domínio estiver verificado no Resend, envia automaticamente de `StartMedia <contato@startmediadigital.com.br>` para `contato@startmediadigital.com.br` (eliminando o uso do onboarding@resend.dev).
* **Conteúdo Detalhado:** 
  1. Tabela com Nome, E-mail e WhatsApp do Lead.
  2. Destaque em bloco verde da Data e Hora do Agendamento (se houver).
  3. Relatório de Maturidade Digital da Empresa escrito pela IA (`diagnosticoFinal.pergunta`).
  4. Lista de Serviços do Portfólio Recomendados com as Justificativas Técnicas e Estatísticas de Mercado.
  5. Estimativa de Faixa de Investimento Sugerida e Nota de Disclaimer Financeiro.
  6. **Manual de Reenvio Rápido:** Instruções no rodapé para encaminhar o relatório formatado em 10 segundos para a caixa de e-mail do lead.

---
*Este Blueprint foi homologado sob aprovação do usuário e deve ser consultado antes de qualquer alteração estrutural no ecossistema da StartMedia.*
