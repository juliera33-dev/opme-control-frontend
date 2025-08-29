# AkosMed - Frontend do Sistema OPME

Interface web moderna e responsiva para o Sistema de Controle de Materiais OPME da AkosMed.

## 🎨 Características

- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Interface Intuitiva**: Navegação simples e clara
- **Identidade Visual**: Cores e logo da AkosMed integradas
- **Performance**: Carregamento rápido e otimizado

## 🚀 Tecnologias

- **React 19** - Framework frontend
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI modernos
- **Lucide React** - Ícones

## 📱 Páginas

### Dashboard
- Resumo geral do sistema
- Estatísticas de saldos
- Ações rápidas

### Consultar Saldos
- Filtros avançados (cliente, produto, período, CFOP)
- Busca com autocomplete
- Paginação inteligente
- Exportação Excel/PDF

### Notas Fiscais
- Listagem de NFs processadas
- Filtros por data e tipo
- Download de XMLs originais

### Upload XML
- Drag & drop de arquivos
- Validação em tempo real
- Resultados detalhados do processamento

### Sincronizar Mainô
- Teste de conexão com API
- Períodos predefinidos
- Monitoramento de progresso

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Para produção:
```env
VITE_API_BASE_URL=https://sua-api.railway.app
```

### Instalação

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🎨 Customização

### Cores da Marca

As cores da AkosMed estão definidas em:
- `src/index.css` - Classes utilitárias
- `tailwind.config.js` - Configuração do Tailwind

Cor principal: `#2D7D5F` (Verde médico)

### Logo e Favicon

- Logo: `public/logo.png`
- Favicon: `public/favicon.ico`

## 📱 Responsividade

O sistema é totalmente responsivo com:
- Sidebar colapsável em mobile
- Tabelas com scroll horizontal
- Formulários adaptáveis
- Navegação touch-friendly

## 🔍 Funcionalidades

### Busca e Filtros
- Autocomplete de clientes
- Filtros por período
- Filtros por CFOP
- Busca em tempo real

### Exportação
- Excel com formatação
- PDF com layout profissional
- Filtros aplicados mantidos

### Validações
- Formatação automática de CNPJ/CPF
- Validação de datas
- Feedback visual de erros

## 🚀 Deploy

### Build
```bash
npm run build
```

### Deploy Estático
A pasta `dist` pode ser hospedada em:
- Vercel
- Netlify
- Railway (static)
- GitHub Pages

### Configuração do Servidor
Para SPAs, configure o servidor para:
- Servir `index.html` para todas as rotas
- Habilitar CORS se necessário
- Configurar cache para assets

## 📊 Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Code Splitting**: Bundle otimizado
- **Tree Shaking**: Código não utilizado removido
- **Minificação**: Assets comprimidos

## 🔒 Segurança

- Sanitização de inputs
- Validação client-side
- Headers de segurança
- HTTPS obrigatório em produção

---

**AkosMed** - Interface do Sistema de Controle OPME

