import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// ===================================================================================
// DADOS SIMULADOS (MOCK DATA) - ESTRUTURA ATUALIZADA
// ===================================================================================

const generateMockData = (count) => {
    const postes = [];
    const detalhes = [];
    const ocupacao = [];
    const mun = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador'];
    const sitAtiv = ['ATIVO', 'INATIVO', 'PROJETADO', 'RETIRADO'];
    const tipUnid = ['Poste de Concreto DT', 'Poste de Concreto CC', 'Poste de Madeira', 'Poste Metálico'];

    for (let i = 1; i <= count; i++) {
        const codId = 1000 + i;
        const municipio = mun[i % mun.length];
        
        // Tabela Postes
        postes.push({
            COD_ID: codId,
            X: -23.5505 + (Math.random() - 0.5) * 0.1,
            Y: -46.6333 + (Math.random() - 0.5) * 0.1,
            OBJECTID: 10000 + i,
            DIST: Math.floor(Math.random() * 100),
            FAS_CON: 'ABC',
            SIT_ATIV: sitAtiv[i % sitAtiv.length],
            TIP_UNID: tipUnid[i % tipUnid.length],
            POT_NOM: '15', // kVA
            PAC_1: `PAC1-${i}`,
            PAC_2: `PAC2-${i}`,
            CTMT: `CTMT-${Math.floor(i/10)}`,
            UNI_TR_AT: 12345 + i,
            SUB: `SUB-${i % 5}`,
            CONJ: i % 10,
            MUN: municipio,
            DAT_CON: `202${Math.floor(i % 5)}/01/15`,
            BANC: i % 3,
            POS: 'C',
            DESCR: `Descrição do poste ${codId}`,
            ARE_LOC: 'URBANA',
        });

        // Tabela Detalhes_Postes
        detalhes.push({
            COD_ID: codId,
            P_N_OPE: `OP-${i}`,
            CAP_ELO: `${i % 3 + 1} Elos`,
            COR_NOM: '200A',
            TLCD: i % 2, // 0 ou 1
            DAT_CON: `202${Math.floor(i % 5)}/02/20`,
            CTMT: `CTMT-${Math.floor(i/10)}`,
            UNI_TR_AT: 12345 + i,
            SUB: `SUB-${i % 5}`,
            CONJ: i % 10,
            MUN: municipio,
            DESCR: `Detalhes técnicos do poste ${codId}`,
            ARE_LOC: 'URBANA',
        });
        
        // Tabela Telecom_Ocupacao
        if (i % 2 === 0) {
            ocupacao.push({
                COD_ID: codId,
                PN_CON_1: `ISP-${i % 7 + 1}`,
                PN_CON_2: 2000 + i,
                CTAT: 3000 + i,
                CT_COD_OP: `OP-TELECOM-${i % 7 + 1}`,
                SITCONT: i % 3 === 0 ? 'REGULAR' : 'PENDENTE',
                COMP: 'Fibra Óptica',
                DESCR: 'Cabo de fibra óptica para distribuição FTTH.'
            });
            if (i % 4 === 0) {
                 ocupacao.push({
                    COD_ID: codId,
                    PN_CON_1: `ISP-${i % 5 + 2}`,
                    PN_CON_2: 4000 + i,
                    CTAT: 5000 + i,
                    CT_COD_OP: `OP-TELECOM-${i % 5 + 2}`,
                    SITCONT: 'IRREGULAR',
                    COMP: 'Cabo Coaxial',
                    DESCR: 'Cabo coaxial legado.'
                });
            }
        }
    }
    return { postes, detalhes, ocupacao };
};

const { postes: tabelaPostes, detalhes: tabelaDetalhesPostes, ocupacao: tabelaTelecomOcupacao } = generateMockData(150);

// ===================================================================================
// ÍCONES SVG
// ===================================================================================

const Icon = ({ path }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
        <path d={path}></path>
    </svg>
);

const ICONS = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    gis: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    assets: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z",
    commercial: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
    comms: "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z",
    admin: "M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59-1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"
};


// ===================================================================================
// COMPONENTES REUTILIZÁVEIS
// ===================================================================================

const Card = ({ title, children }: { title?: any, children: any }) => (
    <div className="card">
        {title && <h4 className="card-title">{title}</h4>}
        {children}
    </div>
);

const StatCard = ({ value, label }) => (
    <Card>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
    </Card>
);

const Modal = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>{title}</h4>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const Table = ({ columns, data, onRowClick, clickable = false }: { columns: any, data: any, onRowClick?: any, clickable?: boolean }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = useMemo(() => 
        data.filter(item => 
            Object.values(item).some(val => 
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        ), [data, searchTerm]);

    const paginatedData = useMemo(() => 
        filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [filteredData, currentPage]
    );
    
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <Card>
            <div className="table-controls">
                <input 
                    type="text" 
                    placeholder="Pesquisar na tabela..."
                    className="search-input"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <div className="pagination-controls">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Próxima</button>
                </div>
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>{columns.map(col => <th key={col.key}>{col.header}</th>)}</tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, index) => (
                            <tr key={index} onClick={() => onRowClick && onRowClick(row)} className={clickable ? 'clickable' : ''}>
                                {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};


const Tabs = ({ items }) => {
    const [activeTab, setActiveTab] = useState(0);
    return (
        <div>
            <nav className="tabs-nav">
                {items.map((item, index) => (
                    <button 
                        key={index}
                        className={`tab-button ${activeTab === index ? 'active' : ''}`}
                        onClick={() => setActiveTab(index)}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="tab-content">
                {items[activeTab].content}
            </div>
        </div>
    );
};


// ===================================================================================
// COMPONENTES DE LAYOUT
// ===================================================================================

const menuConfig = [
    { name: "Dashboard", path: "dashboard", icon: ICONS.dashboard, submenus: [
        { name: "Visão Geral", path: "visao-geral" },
        { name: "Visão Financeira", path: "visao-financeira" },
        { name: "Alertas Pendentes", path: "alertas-pendentes" },
    ]},
    { name: "Módulo GIS", path: "gis", icon: ICONS.gis, submenus: [
        { name: "Mapa Interativo", path: "mapa-interativo" },
        { name: "Gestão de Camadas", path: "gestao-camadas" },
        { name: "Análise de Dados", path: "analise-dados" },
    ]},
    { name: "Gestão de Ativos", path: "ativos", icon: ICONS.assets, submenus: [
        { name: "Inventário de Postes", path: "inventario" },
        { name: "Análise de Risco", path: "risco" },
    ]},
    { name: "Gestão Comercial", path: "comercial", icon: ICONS.commercial, submenus: [
        { name: "Exploração Comercial", path: "exploracao" },
        { name: "Alertas Gerais", path: "alertas" },
        { name: "Novos Negócios", path: "negocios" },
    ]},
    { name: "Comunicação e Regul.", path: "comunicacao", icon: ICONS.comms, submenus: [
        { name: "Regularização de ISPs", path: "regularizacao" },
        { name: "Leilão de Excedentes", path: "leilao" },
    ]},
    { name: "Configurações", path: "config", icon: ICONS.admin, submenus: [
        { name: "Usuários e Permissões", path: "usuarios" },
        { name: "Dados e Integração", path: "integracao" },
        { name: "Empresa", path: "empresa" },
        { name: "Gestão de Contratos", path: "contratos" },
    ]},
    { name: "Relatórios", path: "relatorios", icon: ICONS.dashboard, submenus: [
        { name: "Inadimplência", path: "inadimplencia" },
        { name: "Ocupação", path: "ocupacao" },
        { name: "Personalizados", path: "personalizados" },
    ]},
];

const Header = ({ currentPath, navigateTo }) => {
    const activeModule = currentPath.split('/')[0];
    
    const handleNavClick = (e, path) => {
        e.preventDefault();
        navigateTo(path);
    };

    return (
        <header className="app-header">
            <div className="header-logo">
                <h1>Infragrid</h1>
            </div>
            <nav className="header-nav">
                <ul>
                    {menuConfig.map(item => (
                         <li key={item.path} className={activeModule === item.path ? 'active' : ''}>
                             <a href="#" onClick={(e) => handleNavClick(e, `${item.path}/${item.submenus[0].path}`)}>
                                <Icon path={item.icon} />
                                <span>{item.name}</span>
                            </a>
                         </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

const SecondarySidebar = ({ currentPath, navigateTo }) => {
    const activeModulePath = currentPath.split('/')[0];
    const activeModule = menuConfig.find(m => m.path === activeModulePath);

    if (!activeModule) return null;

    const handleNavClick = (e, path) => {
        e.preventDefault();
        navigateTo(path);
    };

    return (
        <aside className="secondary-sidebar">
            <h3 className="secondary-sidebar-title">{activeModule.name}</h3>
            <nav className="secondary-sidebar-nav">
                <ul>
                    {activeModule.submenus.map(sub => (
                        <li key={sub.path} className={currentPath === `${activeModule.path}/${sub.path}` ? 'active' : ''}>
                            <a href="#" onClick={(e) => handleNavClick(e, `${activeModule.path}/${sub.path}`)}>
                                {sub.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

const Layout = ({ children, currentPath, navigateTo }) => (
    <div className="app-layout">
        <Header currentPath={currentPath} navigateTo={navigateTo} />
        <div className="app-body">
            <SecondarySidebar currentPath={currentPath} navigateTo={navigateTo} />
            <main className="main-content">
                <div className="content-area">{children}</div>
            </main>
        </div>
    </div>
);


// ===================================================================================
// PÁGINAS E MÓDULOS
// ===================================================================================

const PageHeader = ({title, subtitle}: {title: any, subtitle?: any}) => (
    <div className="page-header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
    </div>
);

const PlaceholderPage = ({ title, subtitle }: { title: any, subtitle?: any }) => (
    <div>
        <PageHeader title={title} subtitle={subtitle || "Funcionalidade em desenvolvimento."} />
        <Card>
            <p>Esta é uma página de demonstração para a seção "{title}". O conteúdo e as funcionalidades completas serão implementados em fases futuras do projeto.</p>
        </Card>
    </div>
);

// --- Dashboard ---
const DashboardVisaoGeral = () => {
    const postesOcupados = tabelaPostes.filter(p => tabelaTelecomOcupacao.some(o => o.COD_ID === p.COD_ID)).length;
    return (
        <div>
            <PageHeader title="Visão Geral" subtitle="Resumo das principais métricas da plataforma." />
            <div className="dashboard-grid">
                <StatCard value={tabelaPostes.length} label="Total de Postes" />
                <StatCard value={postesOcupados} label="Postes Ocupados" />
                <StatCard value={tabelaPostes.length - postesOcupados} label="Postes Disponíveis" />
                <StatCard value="15" label="Contratos a Vencer" />
                <Card title="Ocupação por ISP">
                   <div className="chart-container" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>Gráfico de Pizza</div>
                </Card>
                <Card title="Receita Mensal (Estimada)">
                   <div className="chart-container" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>Gráfico de Barras</div>
                </Card>
            </div>
        </div>
    );
};

// --- GIS ---
const GisMapaInterativo = () => {
    const [selectedPoste, setSelectedPoste] = useState(null);
    const postesVisiveis = tabelaPostes.slice(0, 20); // Limita para performance

    const handlePoleClick = (poste) => {
        const detalhes = tabelaDetalhesPostes.find(d => d.COD_ID === poste.COD_ID) || {};
        setSelectedPoste({...poste, ...detalhes});
    };
    
    return (
        <div>
            <PageHeader title="Mapa Interativo" subtitle="Visualize os postes geograficamente."/>
            <Card>
                <div className="map-container">
                    {postesVisiveis.map(p => (
                        <div 
                            key={p.COD_ID} 
                            className="pole-icon" 
                            style={{ 
                                top: `${(1 - (p.X - (-23.6))) / 0.1 * 100}%`,
                                left: `${(p.Y - (-46.6833)) / 0.1 * 100}%`
                             }}
                            onClick={() => handlePoleClick(p)}
                            title={String(p.COD_ID)}
                        ></div>
                    ))}
                </div>
            </Card>
            <Modal title={`Detalhes do Poste: ${selectedPoste?.COD_ID}`} isOpen={!!selectedPoste} onClose={() => setSelectedPoste(null)}>
                {selectedPoste && (
                    <div className="details-grid">
                       <div className="detail-item"><strong>Status:</strong> {selectedPoste.SIT_ATIV}</div>
                       <div className="detail-item"><strong>Município:</strong> {selectedPoste.MUN}</div>
                       <div className="detail-item"><strong>Tipo:</strong> {selectedPoste.TIP_UNID}</div>
                       <div className="detail-item"><strong>Operadora:</strong> {selectedPoste.P_N_OPE}</div>
                    </div>
                )}
            </Modal>
        </div>
    );
};


// --- Gestão de Ativos ---
const GestaoInventarioPostes = ({ navigateTo }) => {
    const columns = [
        { header: "COD ID", key: "COD_ID" },
        { header: "Status", key: "SIT_ATIV" },
        { header: "Tipo", key: "TIP_UNID" },
        { header: "Município", key: "MUN" },
        { header: "Data Construção", key: "DAT_CON" },
    ];

    const handleRowClick = (row) => {
        navigateTo(`ativos/inventario/${row.COD_ID}`);
    };

    return (
        <div>
            <PageHeader title="Inventário de Postes" subtitle="Visualize e gerencie todos os postes cadastrados." />
            <Table columns={columns} data={tabelaPostes} onRowClick={handleRowClick} clickable={true} />
        </div>
    );
};

const DetalhesPoste = ({ posteId }) => {
    const posteIdNum = parseInt(posteId, 10);
    const poste = tabelaPostes.find(p => p.COD_ID === posteIdNum);
    const detalhes = tabelaDetalhesPostes.find(d => d.COD_ID === posteIdNum);
    const ocupacao = tabelaTelecomOcupacao.filter(o => o.COD_ID === posteIdNum);
    
    if (!poste) return <PageHeader title="Poste não encontrado" />;

    const tabs = [
        { 
            label: "Dados Gerais e Localização", 
            content: (
                <div className="details-grid">
                    <div className="detail-item"><strong>COD ID:</strong> {poste.COD_ID}</div>
                    <div className="detail-item"><strong>Status:</strong> {poste.SIT_ATIV}</div>
                    <div className="detail-item"><strong>Município:</strong> {poste.MUN}</div>
                    <div className="detail-item"><strong>Coordenada X:</strong> {poste.X.toFixed(6)}</div>
                    <div className="detail-item"><strong>Coordenada Y:</strong> {poste.Y.toFixed(6)}</div>
                    <div className="detail-item"><strong>Data Construção:</strong> {poste.DAT_CON}</div>
                    <div className="detail-item"><strong>Tipo Unidade:</strong> {poste.TIP_UNID}</div>
                    <div className="detail-item"><strong>Área de Locação:</strong> {poste.ARE_LOC}</div>
                    <div className="detail-item"><strong>Conjunto:</strong> {poste.CONJ}</div>
                    <div className="detail-item"><strong>Subestação:</strong> {poste.SUB}</div>
                    <div className="detail-item"><strong>Circuito (CTMT):</strong> {poste.CTMT}</div>
                    <div className="detail-item"><strong>Descrição:</strong> {poste.DESCR}</div>
                </div>
            )
        },
        { 
            label: "Características Técnicas", 
            content: (
                <div className="details-grid">
                    <div className="detail-item"><strong>Potência Nominal:</strong> {poste.POT_NOM} kVA</div>
                    <div className="detail-item"><strong>Fase de Conexão:</strong> {poste.FAS_CON}</div>
                    <div className="detail-item"><strong>Operadora (P_N_OPE):</strong> {detalhes?.P_N_OPE}</div>
                    <div className="detail-item"><strong>Capacidade Elos:</strong> {detalhes?.CAP_ELO}</div>
                    <div className="detail-item"><strong>Corrente Nominal:</strong> {detalhes?.COR_NOM}</div>
                    <div className="detail-item"><strong>TLCD:</strong> {detalhes?.TLCD ? 'Sim' : 'Não'}</div>
                    <div className="detail-item"><strong>Unidade Transformadora:</strong> {poste.UNI_TR_AT}</div>
                    <div className="detail-item"><strong>PAC 1:</strong> {poste.PAC_1}</div>
                    <div className="detail-item"><strong>PAC 2:</strong> {poste.PAC_2}</div>
                    <div className="detail-item"><strong>Banco:</strong> {poste.BANC}</div>
                    <div className="detail-item"><strong>Posição:</strong> {poste.POS}</div>
                </div>
            )
        },
        { 
            label: `Ocupação Telecom (${ocupacao.length})`, 
            content: (
                 <Table 
                    columns={[
                        {header: 'ISP (PN_CON_1)', key: 'PN_CON_1'},
                        {header: 'Situação Contrato', key: 'SITCONT'},
                        {header: 'Componente', key: 'COMP'},
                        {header: 'Cód. Operadora', key: 'CT_COD_OP'},
                        {header: 'Descrição', key: 'DESCR'}
                    ]}
                    data={ocupacao}
                />
            )
        },
    ];
    
    return (
        <div>
            <PageHeader title={`Detalhes do Poste: ${posteId}`} subtitle={`Localizado em ${poste.MUN} - ${poste.SIT_ATIV}`} />
            <Card>
                <Tabs items={tabs} />
            </Card>
        </div>
    );
};


// ===================================================================================
// ROTEADOR E APLICAÇÃO PRINCIPAL
// ===================================================================================

const App = () => {
    // Roteamento baseado em estado para evitar problemas de "conexão recusada" no ambiente.
    const [currentView, setCurrentView] = useState({ path: 'dashboard/visao-geral', param: null });

    const navigateTo = (fullPath) => {
        const [main, sub, param] = fullPath.split('/');
        setCurrentView({ path: `${main}/${sub}`, param });
    };

    const renderPage = () => {
        const { path, param } = currentView;
        
        if (path === 'ativos/inventario' && param) {
            return <DetalhesPoste posteId={param} />;
        }
        
        switch (path) {
            case 'dashboard/visao-geral':
                return <DashboardVisaoGeral />;
            case 'gis/mapa-interativo':
                return <GisMapaInterativo />;
            case 'ativos/inventario':
                return <GestaoInventarioPostes navigateTo={navigateTo} />;
            
            // Placeholder for other pages
            case 'dashboard/visao-financeira': return <PlaceholderPage title="Visão Financeira" />;
            case 'dashboard/alertas-pendentes': return <PlaceholderPage title="Alertas Pendentes" />;
            case 'gis/gestao-camadas': return <PlaceholderPage title="Gestão de Camadas" />;
            case 'gis/analise-dados': return <PlaceholderPage title="Análise de Dados" />;
            case 'ativos/risco': return <PlaceholderPage title="Análise de Risco" />;
            case 'comercial/exploracao': return <PlaceholderPage title="Exploração Comercial" />;
            case 'comercial/alertas': return <PlaceholderPage title="Alertas Gerais" />;
            case 'comercial/negocios': return <PlaceholderPage title="Novos Negócios" />;
            case 'comunicacao/regularizacao': return <PlaceholderPage title="Regularização de ISPs" />;
            case 'comunicacao/leilao': return <PlaceholderPage title="Leilão de Excedentes" />;
            case 'config/usuarios': return <PlaceholderPage title="Usuários e Permissões" />;
            case 'config/integracao': return <PlaceholderPage title="Dados e Integração" />;
            case 'config/empresa': return <PlaceholderPage title="Empresa" />;
            case 'config/contratos': return <PlaceholderPage title="Gestão de Contratos" />;
            case 'relatorios/inadimplencia': return <PlaceholderPage title="Relatórios de Inadimplência" />;
            case 'relatorios/ocupacao': return <PlaceholderPage title="Relatórios de Ocupação" />;
            case 'relatorios/personalizados': return <PlaceholderPage title="Relatórios Personalizados" />;
            
            default:
                // Renderiza a página padrão se a rota for desconhecida
                return <DashboardVisaoGeral />;
        }
    };

    return (
        <Layout currentPath={currentView.path} navigateTo={navigateTo}>
            {renderPage()}
        </Layout>
    );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);