# 🧠 MedMaster AI - Plataforma de Estudos Médicos com IA

Sistema completo de questões médicas adaptativas desenvolvido em **React + TypeScript + Tailwind CSS**.

Convertido de HTML/CSS/JS puro para um framework moderno e escalável.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Acessar
http://localhost:5173
```

## 🎯 Funcionalidades

### 🌐 Páginas Públicas
- **Landing Page** - Hero section, recursos, depoimentos
- **Login** - Autenticação (use qualquer email/senha)
- **Cadastro** - Registro em 3 etapas com barra de progresso

### 🔐 Páginas Protegidas
- **Dashboard** - Estatísticas, gráficos, atividades recentes
- **Questões** - Seleção de modo de estudo
- **Modo Dissertativo** - Questões abertas com correção detalhada por IA
- **Modo Objetivo** - Múltipla escolha estilo residência médica
- **Estatísticas** - Gráficos de desempenho mensal
- **Material de Estudo** - Recursos complementares
- **Perfil** - Informações do usuário e conquistas

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 19.x | Framework UI |
| TypeScript | 5.9.x | Tipagem estática |
| Vite | 7.x | Build tool |
| Tailwind CSS | 3.x | Estilização |
| React Router | 6.x | Roteamento SPA |
| Recharts | 2.x | Gráficos interativos |
| Lucide React | Latest | Ícones SVG |

## 📁 Estrutura

```
medmaster-react/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── DashboardLayout.tsx
│   ├── contexts/         # Context API
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── pages/           # Páginas da aplicação
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── CadastroPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── QuestoesPage.tsx
│   │   ├── DissertativaPage.tsx
│   │   ├── ObjetivaPage.tsx
│   │   ├── EstatisticasPage.tsx
│   │   ├── EstudosPage.tsx
│   │   └── PerfilPage.tsx
│   ├── App.tsx          # Rotas e providers
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos Tailwind
├── public/              # Assets estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

## 🎨 Design System

### Cores
- **Blue Med**: `#1e40af` - Cor primária
- **Blue Light**: `#3b82f6` - Cor secundária
- Paleta completa do Tailwind CSS

### Componentes
- Navbar responsivo
- Sidebar com navegação
- Cards com hover effects
- Formulários estilizados
- Gráficos interativos
- Sistema de notificações toast

## 📱 Responsividade

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔐 Autenticação

Sistema baseado em Context API:
- Login/Logout
- Proteção de rotas privadas
- Persistência em localStorage
- Estado global do usuário

## 📊 Gráficos

Visualizações usando Recharts:
- Bar Chart - Desempenho semanal
- Pie Chart - Performance por especialidade
- Line Chart - Progresso mensal

## 🚀 Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run preview  # Preview da build
npm run lint     # Lint do código
```

## 🔄 Próximos Passos

Para produção real:
- [ ] Conectar backend/API
- [ ] Integrar OpenAI API
- [ ] Sistema de pagamentos
- [ ] Notificações push
- [ ] Autenticação OAuth
- [ ] Testes unitários
- [ ] CI/CD

## ✨ Melhorias vs. HTML Original

### ✅ Implementado
- Componentização modular
- TypeScript para segurança de tipos
- Context API para estado global
- Roteamento SPA sem reload
- Animações CSS suaves
- Layout responsivo aprimorado
- Sistema de notificações
- Gráficos interativos profissionais

### 🎯 Visual Mantido
- Mesma paleta de cores
- Layout similar
- Imagens originais (Unsplash)
- Experiência familiar

## 📦 Build & Deploy

```bash
npm run build
```

Build otimizado em `dist/` pronto para:
- Vercel
- Netlify
- GitHub Pages
- Qualquer servidor estático

## 🤝 Contribuindo

Este projeto foi desenvolvido como migração de HTML puro para React.

---

**Desenvolvido com ❤️ usando React + TypeScript + Tailwind CSS**

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
