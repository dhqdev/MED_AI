# Configuração das APIs de IA

Para que a integração com IA funcione, você precisa configurar a API Key do Google Gemini.

## Passos:

1. **Obtenha sua API Key do Gemini:**
   - Acesse https://makersuite.google.com/app/apikey
   - Faça login com sua conta Google
   - Crie uma nova API Key
   - Copie a chave gerada

2. **Configure no projeto:**
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione a seguinte linha:
     ```
     VITE_GEMINI_API_KEY=sua_api_key_aqui
     ```
   - Substitua `sua_api_key_aqui` pela sua chave real

3. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

## Login Demo

Use as seguintes credenciais para fazer login:
- **Email:** demo@medmaster.com
- **Senha:** demo123

## Funcionalidades

- ✅ Login mockado simples (sem Supabase)
- ✅ Dados iniciais zerados (progresso começa vazio)
- ✅ Progresso atualizado conforme você usa
- ✅ Integração real com Google Gemini para:
  - Gerar questões objetivas (com 3 níveis: Fácil, Médio, Difícil)
  - Gerar questões dissertativas (com 3 níveis: Fácil, Médio, Difícil)
  - Corrigir respostas dissertativas com feedback detalhado
  - Criar planos de estudo personalizados
  - Gerar scripts para áudio educativo
  - Criar roteiros para vídeos educativos
- ✅ Estatísticas calculadas baseadas em dados reais
- ✅ Histórico de questões respondidas
- ✅ Materiais de estudo personalizados baseados no desempenho
- ✅ Modal de boas-vindas após login
- ✅ Sistema de sessões e metas
- ✅ Sugestões inteligentes de tópicos

## Níveis de Dificuldade

### ⭐ Fácil
- Conceitos básicos e fundamentais
- Perguntas sobre definições
- Características principais
- Ideal para revisão inicial

### ⭐⭐ Médio  
- Aplicação clínica simples
- Sinais e sintomas típicos
- Diagnósticos comuns
- Casos clínicos moderados

### ⭐⭐⭐ Difícil
- Casos clínicos complexos
- Diagnósticos diferenciais avançados
- Decisões terapêuticas difíceis
- Raciocínio clínico aprofundado

## Observações

- Todos os dados são salvos no localStorage do navegador
- A API Key é necessária para gerar questões e corrigir respostas
- O modelo usado é o Gemini Pro (gratuito e poderoso)
- A plataforma se adapta ao seu progresso em tempo real

