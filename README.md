# Infragrid - Protótipo do Sistema de Gestão de Postes

Este é um protótipo de front-end funcional para o Infragrid, uma plataforma de gestão de inventário e exploração comercial para distribuidoras de energia, com foco em funcionalidades de Sistema de Informação Geográfica (GIS).

## Visão Geral

O objetivo deste protótipo é construir uma interface de usuário completa, navegável e interativa que sirva como base para o desenvolvimento completo do sistema. A aplicação foi desenvolvida utilizando React.js e simula dados de backend para demonstrar as funcionalidades principais.

### Funcionalidades Implementadas
- **Navegação Completa:** Um menu lateral permite navegar por todos os módulos e submenus definidos.
- **Dashboard Interativo:** Exibe métricas e gráficos simulados sobre o estado dos ativos.
- **Módulo GIS:** Inclui um mapa interativo simulado com postes clicáveis que exibem informações em um modal.
- **Gestão de Ativos:** Apresenta um inventário de postes em uma tabela com busca e paginação. Permite a visualização de detalhes técnicos, de ocupação e manutenção de cada poste em uma tela dedicada com abas.
- **Módulos Adicionais:** Contém páginas de placeholder para as demais seções (Gestão Comercial, Comunicação, Administração, etc.), demonstrando a estrutura completa de navegação.

## Estrutura do Projeto

Para facilitar a prototipagem e a entrega em um ambiente de desenvolvimento web, a aplicação foi estruturada de forma coesa:

- `index.html`: O ponto de entrada da aplicação. Carrega as fontes, a folha de estilos e o script principal.
- `index.css`: Contém todos os estilos da aplicação. Utiliza variáveis CSS para manter a consistência visual e é totalmente responsivo.
- `index.tsx`: O coração da aplicação. Este arquivo contém:
    1.  **Simulação de Dados:** Objetos e arrays que simulam o banco de dados.
    2.  **Componentes Reutilizáveis:** Componentes como `Card`, `Table`, `Modal`, `Tabs`, etc.
    3.  **Componentes de Layout:** O `Sidebar`, `Header` e o `Layout` principal.
    4.  **Componentes de Página:** Cada tela ou módulo da aplicação (ex: `DashboardVisaoGeral`, `GestaoInventarioPostes`).
    5.  **Lógica de Roteamento:** Um roteador simples baseado no hash da URL (`window.location.hash`) para gerenciar a navegação entre as páginas.
    6.  **Renderização Principal:** O ponto onde a aplicação React é montada no DOM.
- `README.md`: Este arquivo.

## Como Executar Localmente

Este projeto foi construído com as tecnologias web padrão e React. Para executá-lo em um ambiente de desenvolvimento local, você precisaria de um setup com Node.js e um gerenciador de pacotes como npm ou yarn.

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd <nome-do-diretorio>
    ```

2.  **Instale as dependências:**
    (Nota: Este protótipo usa URLs de CDN para React, mas em um projeto local, você instalaria os pacotes)
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm start
    ```

Isso iniciará a aplicação em modo de desenvolvimento e a abrirá no seu navegador, geralmente em `http://localhost:3000`.
