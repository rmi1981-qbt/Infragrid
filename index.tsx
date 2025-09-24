

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import L from 'leaflet';

// ===================================================================================
// CONFIGURAÇÕES GLOBAIS - EDITE AQUI
// ===================================================================================
const supabaseUrl = 'https://euxmgmmukjadphccqdvb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eG1nbW11a2phZHBoY2NxZHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTY0MzQsImV4cCI6MjA3MzA5MjQzNH0.WgCtJPVby7gVa132lwpNAnrETlYpiFM0imU8qS8jP2s';

// Instância única do cliente Supabase para evitar múltiplas conexões.
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const UF_COORDINATES = {
    'AC': { center: [-9.0238, -70.812], zoom: 7 }, 'AL': { center: [-9.5713, -36.782], zoom: 8 },
    'AP': { center: [1.4149, -51.769], zoom: 7 },  'AM': { center: [-3.4168, -65.856], zoom: 6 },
    'BA': { center: [-12.9714, -41.2909], zoom: 7 },'CE': { center: [-5.201, -39.5333], zoom: 8 },
    'DF': { center: [-15.7942, -47.8825], zoom: 9 },'ES': { center: [-19.1834, -40.3089], zoom: 8 },
    'GO': { center: [-15.827, -49.8362], zoom: 7 },  'MA': { center: [-5.4244, -45.4428], zoom: 7 },
    'MT': { center: [-12.6819, -56.9219], zoom: 6 },'MS': { center: [-20.3876, -54.4045], zoom: 7 },
    'MG': { center: [-18.5122, -44.555], zoom: 7 },  'PA': { center: [-1.9998, -54.2879], zoom: 6 },
    'PB': { center: [-7.0926, -36.7819], zoom: 8 }, 'PR': { center: [-25.2521, -52.0215], zoom: 7 },
    'PE': { center: [-8.381, -37.848], zoom: 8 },   'PI': { center: [-7.7183, -42.7289], zoom: 7 },
    'RJ': { center: [-22.9068, -43.1729], zoom: 8 },'RN': { center: [-5.7945, -36.9541], zoom: 8 },
    'RS': { center: [-30.0346, -53.1604], zoom: 7 },'RO': { center: [-10.8306, -63.3412], zoom: 7 },
    'RR': { center: [2.737, -61.222], zoom: 7 },   'SC': { center: [-27.2423, -50.2189], zoom: 8 },
    'SP': { center: [-22.25, -48.75], zoom: 7 },     'SE': { center: [-10.9472, -37.0731], zoom: 9 },
    'TO': { center: [-10.1753, -48.2982], zoom: 7 }
};

const ASSET_TABLE_NAMES = {
    POSTES: 'dados_cosern',
    SEGMENTOS_AT: 'a00000020_SSDAT',
    TRANSFORMADORES_AT: 'a00000034_UNTRAT',
    TRANSFORMADORES_MT: 'a00000033_UNTRMT',
    SECCIONADORES_AT: 'a0000002f_UNSEAT'
};

// ===================================================================================
// ÍCONES SVG
// ===================================================================================
const Icon = ({ path, className = "" }) => ( <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" className={className}><path d={path}></path></svg> );
const ICONS = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    gis: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    assets: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z",
    network: "M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm-1 15v-4H9v-2h2V8h2v4h2v2h-2v4h-2z",
    admin: "M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19-.15-.24-.42.12-.64l2 3.46c.12-.22.39-.3.61-.22l2.49 1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l-.38-2.65c.61-.25 1.17-.59-1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z",
    chevronLeft: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z",
    chevronRight: "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z",
    info: "M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
    alert: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    layers: "M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z",
    business: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
    comms: "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z",
    edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
};

// FIX: Moved data hooks before components that use them to resolve declaration-before-use errors.
// ===================================================================================
// HOOKS DE DADOS
// ===================================================================================
const useSupabase = () => {
    return supabase; // Retorna a instância única e global do cliente
};

interface FetchDataOptions {
    select?: string;
    filters?: { column: string; value: any }[];
}

function useFetchData(tableName: string, options: FetchDataOptions = {}) {
    const supabase = useSupabase();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!supabase || !tableName) {
            setError({ message: "Cliente Supabase ou nome da tabela não fornecido."});
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        setData([]); // Limpa os dados antigos para evitar inconsistências durante o carregamento
        try {
            let query = supabase.from(tableName).select(options.select || '*');
            
            if (options.filters && options.filters.length > 0) {
                options.filters.forEach(filter => {
                    if(filter && filter.column && filter.value) {
                       query = query.eq(filter.column, filter.value);
                    }
                });
            }

            const { data, error } = await query;

            if (error) throw error;
            setData(data);
        // FIX: Explicitly type 'err' as 'any' to resolve 'Cannot find name' error in catch block.
        } catch (err: any) {
            setError(err);
            console.error(`Erro ao buscar dados da tabela ${tableName}:`, err);
        } finally {
            setIsLoading(false);
        }
    }, [supabase, tableName, options.select, JSON.stringify(options.filters)]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}

function useFetchRpc(functionName: string, params?: object) {
    const supabase = useSupabase();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!supabase || !functionName) {
            setError({ message: "Cliente Supabase ou nome da função não fornecido." });
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        setData([]);

        try {
            const { data, error } = await supabase.rpc(functionName, params || {});

            if (error) throw error;
            setData(data || []); // Ensure data is always an array
        // FIX: Explicitly type 'err' as 'any' to resolve 'Cannot find name' error in catch block.
        } catch (err: any) {
            setError(err);
            console.error(`Erro ao chamar a função ${functionName}:`, err);
        } finally {
            setIsLoading(false);
        }
    }, [supabase, functionName, JSON.stringify(params)]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}

// ===================================================================================
// COMPONENTES REUTILÍVEIS
// ===================================================================================

const Card = ({ title, children, className="" }: React.PropsWithChildren<{ title?: any; className?: string; }>) => (
    <div className={`card ${className}`}>
        {title && <h4 className="card-title">{title}</h4>}
        {children}
    </div>
);

const Table = ({ columns, data, onEdit, onDelete, onRowClick, onLinkClick, columnLinks, isLoading, error }: { columns: any; data: any; onEdit?: (row: any) => void; onDelete?: (row: any) => void; onRowClick?: (row: any) => void; onLinkClick?: (config: any, value: any) => void; columnLinks?: any; isLoading?: boolean; error?: any; }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = useMemo(() => 
        (data || []).filter(item => 
            Object.values(item).some(val => 
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        ), [data, searchTerm]);

    const paginatedData = useMemo(() => 
        filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const tableColumns = [...columns];
    if (onEdit || onDelete) {
        tableColumns.push({
            Header: 'Ações',
            accessor: 'actions',
            Cell: (row) => (
                <div className="actions-cell">
                    {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(row); }} className="action-btn btn-edit"><Icon path={ICONS.edit} /></button>}
                    {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(row); }} className="action-btn btn-delete"><Icon path={ICONS.delete} /></button>}
                </div>
            )
        });
    }

    if (isLoading) return <LoadingSpinner message="Carregando dados da tabela..." />;
    if (error) return <ErrorMessage title="Erro ao carregar tabela" errorObj={error} />;

    return (
        <div>
            <div className="table-controls">
                <input
                    type="text"
                    placeholder="Buscar em todos os campos..."
                    className="search-input"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {tableColumns.map(col => <th key={col.accessor}>{col.Header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, i) => (
                            <tr key={row.id || row.OBJECTID || i} className={onRowClick ? 'clickable' : ''} onClick={() => onRowClick && onRowClick(row)}>
                                {tableColumns.map(col => (
                                    <td key={col.accessor} data-label={col.Header}>
                                        {col.Cell ? col.Cell(row) : 
                                         (columnLinks && columnLinks[col.accessor] && onLinkClick) ? 
                                            <a href="#" className="cell-link" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLinkClick(columnLinks[col.accessor], row[col.accessor]); }}>{row[col.accessor]}</a>
                                            : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-controls">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    <Icon path={ICONS.chevronLeft} />
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    <Icon path={ICONS.chevronRight} />
                </button>
            </div>
        </div>
    );
};

const LoadingSpinner = ({ message = "Carregando..." }: { message?: string }) => (
    <div className="loading-spinner">
        <div className="spinner"></div>
        <span>{message}</span>
    </div>
);

const ErrorMessage = ({ title, message, errorObj }: { title: string; message?: string; errorObj?: any; }) => {
    let detailedMessage = message || errorObj?.message || 'Ocorreu um erro desconhecido.';
    let details = errorObj?.details;
    let hint = errorObj?.hint;

    if (errorObj instanceof TypeError && errorObj.message.includes('Failed to fetch')) {
        detailedMessage = "Não foi possível conectar ao servidor. Isso pode ser um problema de rede ou uma configuração de CORS no seu projeto Supabase.";
        details = "Verifique sua conexão com a internet e certifique-se de que o domínio da aplicação está liberado nas configurações de CORS do Supabase (Project Settings > API > CORS configuration).";
        hint = "Para desenvolvimento, você pode adicionar '*' como um padrão permitido, mas use um domínio específico em produção.";
    }

    return (
        <div className="error-message">
            <h4><Icon path={ICONS.alert} /> {title}</h4>
            <p>{detailedMessage}</p>
            {details && <p><small>Detalhes: {details}</small></p>}
            {hint && <p><small>Dica: {hint}</small></p>}
        </div>
    );
};

const FullPageLoader = ({ message }) => (
    <div className="full-page-loader">
        <LoadingSpinner message={message} />
    </div>
);

const ConfigError = ({ error }) => (
    <div className="config-error-container">
        <h3><Icon path={ICONS.alert} /> Erro de Configuração</h3>
        <p>A aplicação não pôde ser iniciada. Isso geralmente ocorre por uma de duas razões:</p>
        <ol style={{textAlign: 'left', margin: '1.5rem auto', maxWidth: '600px'}}>
            <li>As credenciais do Supabase (<code>supabaseUrl</code> ou <code>supabaseAnonKey</code>) estão incorretas ou não foram definidas.</li>
            <li>As políticas de segurança de acesso (RLS) não foram configuradas para as tabelas no Supabase, impedindo a leitura dos dados.</li>
        </ol>
        <p>Por favor, verifique o arquivo <code>README.md</code> para as instruções de configuração.</p>
        <div className="error-details">
            <strong>Mensagem do Erro:</strong>
            <pre>{error.message}</pre>
        </div>
    </div>
);

const Modal = ({ isOpen, onClose, title, children }: React.PropsWithChildren<{ isOpen: boolean; onClose: () => void; title: string }>) => {
    if (!isOpen) return null;
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>{title}</h4>
                    <button onClick={onClose} className="action-btn"><Icon path={ICONS.close}/></button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

const AssetForm = ({ asset, columns, tableName, onSave, onCancel }: { asset?: any; columns: any[]; tableName: string; onSave: () => void; onCancel: () => void; }) => {
    const supabase = useSupabase();
    const [formData, setFormData] = useState(() => {
        const initialState = {};
        columns.forEach(col => {
            initialState[col.accessor] = asset ? asset[col.accessor] ?? '' : '';
        });
        return initialState;
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        
        const submissionData = { ...formData };
        const nonEditableKeys = ['id', 'geom', 'objectid', 'shape_length', 'actions', 'OBJECTID', 'Latitude', 'Longitude'];
        nonEditableKeys.forEach(key => delete submissionData[key]);


        try {
            let response;
            const idKey = asset?.id ? 'id' : 'OBJECTID';
            const idValue = asset?.[idKey];

            if (asset && idValue) { 
                response = await supabase.from(tableName).update(submissionData).eq(idKey, idValue);
            } else { 
                response = await supabase.from(tableName).insert([submissionData]).select();
            }

            if (response.error) {
                throw response.error;
            }
            onSave();
        } catch (err: any) {
            console.error("Erro ao salvar o ativo:", err);
            setError(`Falha ao salvar: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const editableColumns = columns.filter(c => !['id', 'geom', 'objectid', 'shape_length', 'actions', 'OBJECTID', 'COD_ID'].includes(c.accessor));

    return (
        <form onSubmit={handleSubmit} className="asset-form">
            {editableColumns.map(col => (
                <div className="form-group" key={col.accessor}>
                    <label htmlFor={col.accessor}>{col.Header}</label>
                    <input
                        type="text"
                        id={col.accessor}
                        name={col.accessor}
                        value={formData[col.accessor] || ''}
                        onChange={handleChange}
                        disabled={isSaving}
                    />
                </div>
            ))}
            {error && <p className="form-error">{error}</p>}
            <div className="modal-footer">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </form>
    );
};


// ===================================================================================
// COMPONENTES DE MÓDULO (PÁGINAS)
// ===================================================================================
const SideMapPanel = ({ asset, isOpen, onClose }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (isOpen && !mapRef.current) {
            mapRef.current = L.map('side-map-instance', {
                zoomControl: false,
                attributionControl: false
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && mapRef.current && asset) {
            let coordinates;
            // Handle GeoJSON points from PostGIS
            if (asset.geom && asset.geom.type === 'Point') {
                coordinates = [asset.geom.coordinates[1], asset.geom.coordinates[0]];
            // Handle Latitude/Longitude columns from dados_cosern
            } else if (asset.Latitude && asset.Longitude) {
                coordinates = [asset.Latitude, asset.Longitude];
            } else {
                return; // Not enough data to show on map
            }

            mapRef.current.setView(coordinates, 18);
            
            if(markerRef.current) {
                mapRef.current.removeLayer(markerRef.current);
            }

            const pulsatingIcon = L.divIcon({
                className: 'pulsating-marker',
                iconSize: [20, 20]
            });

            markerRef.current = L.marker(coordinates, { icon: pulsatingIcon }).addTo(mapRef.current);
            
            setTimeout(() => {
                 mapRef.current.invalidateSize();
            }, 300);
        }
    }, [asset, isOpen]);

    return (
        <div className={`side-map-panel-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`side-map-panel ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="side-map-close-btn"><Icon path={ICONS.close} /></button>
                <div id="side-map-instance" className="map-container-side"></div>
                {asset && <div className="side-map-info"><h4>{asset.COD_ID || asset.cod_id || `ID: ${asset.OBJECTID || asset.id}`}</h4></div>}
            </div>
        </div>
    );
};

const DashboardModule = ({ onSelectAssetForMap }) => {
    const { data: untratData, isLoading: l1, error: e1 } = useFetchData(ASSET_TABLE_NAMES.TRANSFORMADORES_AT);
    const { data: untrmtData, isLoading: l2, error: e2 } = useFetchData(ASSET_TABLE_NAMES.TRANSFORMADORES_MT);
    const { data: ssdatData, isLoading: l3, error: e3 } = useFetchData(ASSET_TABLE_NAMES.SEGMENTOS_AT);
    const { data: unseatData, isLoading: l4, error: e4 } = useFetchData(ASSET_TABLE_NAMES.SECCIONADORES_AT);
    const { data: postesData, isLoading: l5, error: e5 } = useFetchData(ASSET_TABLE_NAMES.POSTES);

    const stats = useMemo(() => {
        const totalRedeAT = (ssdatData || []).reduce((acc, curr) => acc + (curr.comp || 0), 0) / 1000; // em km
        return {
            totalTransformadoresAT: (untratData || []).length,
            totalTransformadoresMT: (untrmtData || []).length,
            totalSeccionadoresAT: (unseatData || []).length,
            extensaoRedeAT: totalRedeAT.toFixed(2),
            totalPostes: (postesData || []).length,
        };
    }, [untratData, untrmtData, ssdatData, unseatData, postesData]);

    const isLoading = l1 || l2 || l3 || l4 || l5;
    const error = e1 || e2 || e3 || e4 || e5;

    if (isLoading) return <FullPageLoader message="Carregando dados do dashboard..." />;
    if (error) return <ConfigError error={error} />;

    return (
        <div className="content-area">
            <div className="page-header">
                <div>
                    <h3>Dashboard Operacional BDGD</h3>
                    <p>Visão geral dos ativos da Base de Dados Geográfica da Distribuidora.</p>
                </div>
            </div>
            <div className="dashboard-grid wide">
                <Card><p className="stat-card-value">{stats.totalTransformadoresAT.toLocaleString()}</p><p className="stat-card-label">Transformadores de Alta Tensão</p></Card>
                <Card><p className="stat-card-value">{stats.totalTransformadoresMT.toLocaleString()}</p><p className="stat-card-label">Transformadores de Média Tensão</p></Card>
                <Card><p className="stat-card-value">{stats.totalSeccionadoresAT.toLocaleString()}</p><p className="stat-card-label">Seccionadores de Alta Tensão</p></Card>
                <Card><p className="stat-card-value">{stats.extensaoRedeAT} <span style={{fontSize: '1.5rem'}}>km</span></p><p className="stat-card-label">Extensão da Rede de Alta Tensão</p></Card>
                <Card><p className="stat-card-value">{stats.totalPostes.toLocaleString()}</p><p className="stat-card-label">Postes / Pontos Notáveis</p></Card>
            </div>
             <Card title="Últimos Transformadores de Alta Tensão Registrados" className="card-margin-top">
                <Table
                    columns={[
                        { Header: 'Cód. ID', accessor: 'cod_id' },
                        { Header: 'Subestação', accessor: 'sub' },
                        { Header: 'Situação', accessor: 'sit_ativ' },
                        { Header: 'Pot. Nominal (MVA)', accessor: 'pot_nom' },
                        { Header: 'Município', accessor: 'mun' }
                    ]}
                    data={(untratData || []).slice(0, 100)}
                    onRowClick={onSelectAssetForMap}
                />
            </Card>
        </div>
    );
};

// ===================================================================================
// MÓDULO VISUALIZADOR GIS (ANEEL)
// ===================================================================================

const GisMap = ({ layersConfig }: { layersConfig: { [key: string]: any } }) => {
    const mapRef = useRef(null);
    const layerGroupRef = useRef(L.layerGroup());
    const mapId = 'map-instance';

    useEffect(() => {
        let mapInstance = mapRef.current;
        if (!mapInstance) {
            mapInstance = L.map(mapId, {
                center: [-15.793889, -47.882778], // Brasília
                zoom: 5,
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance);
            layerGroupRef.current.addTo(mapInstance);
            mapRef.current = mapInstance;
        }

        // FIX: Refactored map cleanup logic to use mapRef.current directly, ensuring the correct map instance is removed and avoiding potential type inference issues with the local `mapInstance` variable in the closure.
        return () => {
            if (mapRef.current) {
                (mapRef.current as any).remove();
                mapRef.current = null;
            }
        };
    }, [mapId]);

    useEffect(() => {
        const layerGroup = layerGroupRef.current;
        if (!layerGroup || !mapRef.current) return;

        layerGroup.clearLayers();
        const allBounds = L.latLngBounds();

        Object.values(layersConfig).forEach(config => {
            if (config.isVisible && config.data && config.data.length > 0) {
                 const geoJsonLayer = L.geoJSON(null, {
                    style: config.style,
                    pointToLayer: (feature, latlng) => {
                        return L.circleMarker(latlng, config.style);
                    },
                    onEachFeature: (feature, layer) => {
                        if (feature.properties && feature.properties.popup) {
                            layer.bindPopup(feature.properties.popup, { maxWidth: 400 });
                        }
                    }
                });

                const features = config.data
                    .map(item => {
                        let geometry = item.geom;
                        if (!geometry && item.Latitude && item.Longitude) {
                             geometry = { type: 'Point', coordinates: [item.Longitude, item.Latitude] };
                        }
                        if (!geometry || !geometry.coordinates || !geometry.type) return null;
                        
                        return {
                            type: 'Feature',
                            properties: { popup: config.popupContent(item) },
                            geometry: geometry,
                        };
                    })
                    .filter(Boolean);

                if (features.length > 0) {
                    geoJsonLayer.addData(features);
                    layerGroup.addLayer(geoJsonLayer);
                    try {
                        const bounds = geoJsonLayer.getBounds();
                        if (bounds && bounds.isValid()) {
                            allBounds.extend(bounds);
                        }
                    } catch (e) {
                        console.error("Error extending bounds for layer:", e);
                    }
                }
            }
        });

        if (allBounds.isValid()) {
            mapRef.current.fitBounds(allBounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [layersConfig]);

    return <div id={mapId} style={{ height: '75vh', width: '100%', borderRadius: '8px' }} className="map-container"></div>;
};

const LayerControl = ({ layersConfig, onToggle }: { layersConfig: { [key: string]: any }, onToggle: (layerName: string) => void }) => (
    <div className="map-layer-control">
        <h4><Icon path={ICONS.layers} /> Camadas</h4>
        {Object.entries(layersConfig).map(([layerName, config]) => (
            <div key={layerName} className="layer-toggle">
                <input
                    type="checkbox"
                    id={layerName}
                    checked={config.isVisible}
                    onChange={() => onToggle(layerName)}
                />
                <label htmlFor={layerName}>{layerName}</label>
            </div>
        ))}
    </div>
);


const GisModule = () => {
    const { data: untratData, isLoading: l1, error: e1 } = useFetchData(ASSET_TABLE_NAMES.TRANSFORMADORES_AT);
    const { data: untrmtData, isLoading: l2, error: e2 } = useFetchData(ASSET_TABLE_NAMES.TRANSFORMADORES_MT);
    const { data: ssdatData, isLoading: l3, error: e3 } = useFetchData(ASSET_TABLE_NAMES.SEGMENTOS_AT);
    const { data: unseatData, isLoading: l4, error: e4 } = useFetchData(ASSET_TABLE_NAMES.SECCIONADORES_AT);
    const { data: postesData, isLoading: l5, error: e5 } = useFetchData(ASSET_TABLE_NAMES.POSTES);

    const initialLayersConfig = useMemo(() => ({
        "Postes": {
            data: postesData,
            style: { radius: 5, fillColor: 'var(--info-color)', color: "#fff", weight: 1, opacity: 1, fillOpacity: 0.9 },
            popupContent: (d) => `<h4>Ponto Notável (Poste)</h4><strong>Cód. ID:</strong> ${d.COD_ID}<br/><strong>Estrutura:</strong> ${d.ESTR}<br/><strong>Material:</strong> ${d.MAT}<br/><strong>Altura:</strong> ${d.ALT}<br/><strong>Sit. Contábil:</strong> ${d.SITCONT}`
        },
        "Rede de Alta Tensão": {
            data: ssdatData,
            style: { color: 'var(--danger-color)', weight: 3, opacity: 0.8 },
            popupContent: (d) => `<h4>Segmento de Rede AT</h4><strong>Cód. ID:</strong> ${d.cod_id}<br/><strong>De:</strong> ${d.pn_con_1}<br/><strong>Para:</strong> ${d.pn_con_2}<br/><strong>Comprimento:</strong> ${d.comp}m<br/><strong>Fases:</strong> ${d.fas_con}`
        },
        "Transformadores AT": {
            data: untratData,
            style: { radius: 8, fillColor: '#c53030', color: "#fff", weight: 2, opacity: 1, fillOpacity: 0.9 },
            popupContent: (d) => `<h4>Transformador AT</h4><strong>Cód. ID:</strong> ${d.cod_id}<br/><strong>Potência:</strong> ${d.pot_nom} MVA<br/><strong>Situação:</strong> ${d.sit_ativ}`
        },
        "Transformadores MT": {
            data: untrmtData,
            style: { radius: 6, fillColor: '#dd6b20', color: "#fff", weight: 1.5, opacity: 1, fillOpacity: 0.9 },
            popupContent: (d) => `<h4>Transformador MT</h4><strong>Cód. ID:</strong> ${d.cod_id}<br/><strong>Potência:</strong> ${d.pot_nom} kVA<br/><strong>Posto:</strong> ${d.posto}`
        },
        "Seccionadores AT": {
            data: unseatData,
            style: { radius: 5, fillColor: '#3182ce', color: "#fff", weight: 1, opacity: 1, fillOpacity: 0.9, shape: 'square' },
            popupContent: (d) => `<h4>Seccionador AT</h4><strong>Cód. ID:</strong> ${d.cod_id}<br/><strong>Tipo:</strong> ${d.tip_unid}<br/><strong>Operação:</strong> ${d.p_n_ope}`
        }
    }), [ssdatData, untratData, untrmtData, unseatData, postesData]);
    
    const [layersConfig, setLayersConfig] = useState(() => {
        const initialState = {};
        Object.keys(initialLayersConfig).forEach(name => {
            initialState[name] = { ...initialLayersConfig[name], isVisible: false };
        });
        return initialState;
    });
    
    useEffect(() => {
       setLayersConfig(prev => {
           const newState = {...prev};
           Object.keys(initialLayersConfig).forEach(name => {
               newState[name] = {...newState[name], ...initialLayersConfig[name]};
           });
           return newState;
       })
    }, [initialLayersConfig]);


    const handleToggleLayer = (layerName) => {
        setLayersConfig(prev => ({
            ...prev,
            [layerName]: { ...prev[layerName], isVisible: !prev[layerName].isVisible }
        }));
    };

    const isLoading = l1 || l2 || l3 || l4 || l5;
    const error = e1 || e2 || e3 || e4 || e5;

    return (
        <div className="content-area">
            <div className="page-header">
                <h3>Visualizador GIS (ANEEL BDGD)</h3>
                <p>Camadas de dados geográficos da distribuidora.</p>
            </div>
            <Card>
                {isLoading && <FullPageLoader message="Carregando dados do mapa..." />}
                {error && <ConfigError error={error} />}
                {!isLoading && !error && (
                    <div className="map-with-controls">
                        <LayerControl layersConfig={layersConfig} onToggle={handleToggleLayer} />
                        <GisMap layersConfig={layersConfig} />
                    </div>
                )}
            </Card>
        </div>
    );
};

const RelatedSegments = ({ asset }) => {
    const supabase = useSupabase();
    const [segments, setSegments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSegments = async () => {
            if (!asset || !asset.COD_ID || !supabase) return;
            setIsLoading(true);
            const { data, error } = await supabase
                .from(ASSET_TABLE_NAMES.SEGMENTOS_AT)
                .select('cod_id, ctat, comp, fas_con')
                .or(`pn_con_1.eq.${asset.COD_ID},pn_con_2.eq.${asset.COD_ID}`);

            if (error) {
                console.error("Erro ao buscar segmentos relacionados:", error);
            } else {
                setSegments(data);
            }
            setIsLoading(false);
        };
        fetchSegments();
    }, [asset, supabase]);

    return (
        <div className="related-data-section">
            <h5 className="related-data-title">Segmentos de Rede Conectados</h5>
            {isLoading ? <LoadingSpinner message="Buscando..." /> : (
                segments.length > 0 ? (
                    <ul className="related-data-list">
                        {segments.map(seg => <li key={seg.cod_id}><strong>{seg.cod_id}</strong> ({seg.comp}m, {seg.fas_con})</li>)}
                    </ul>
                ) : <p>Nenhum segmento de rede conectado encontrado.</p>
            )}
        </div>
    );
};

const AssetsModule = ({ onSelectAssetForMap, onNavigateToAsset, activeFilter, onFilterConsumed }) => {
    const supabase = useSupabase();
    const [activeTab, setActiveTab] = useState('postes');
    const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', asset: null, tableName: '', columns: [], refetch: () => {} });
    const [localFilter, setLocalFilter] = useState(null);

    useEffect(() => {
      if (activeFilter) {
        setActiveTab(activeFilter.tabId);
        setLocalFilter([activeFilter.filter]);
        onFilterConsumed();
      }
    }, [activeFilter, onFilterConsumed]);

    const tabsConfig = useMemo(() => [
      { id: 'postes', tableName: ASSET_TABLE_NAMES.POSTES, label: 'Postes', columns: [
        {Header: 'Cód. ID', accessor: 'COD_ID'}, {Header: 'Estrutura', accessor: 'ESTR'}, {Header: 'Material', accessor: 'MAT'}, {Header: 'Altura', accessor: 'ALT'}, {Header: 'Sit. Contábil', accessor: 'SITCONT'}
      ]},
      { id: 'untrat', tableName: ASSET_TABLE_NAMES.TRANSFORMADORES_AT, label: 'Transformadores AT', columns: [
        {Header: 'Cód. ID', accessor: 'cod_id'}, {Header: 'Subestação', accessor: 'sub'}, {Header: 'Potência (MVA)', accessor: 'pot_nom'}, {Header: 'Situação', accessor: 'sit_ativ'}
      ]},
      { id: 'untrmt', tableName: ASSET_TABLE_NAMES.TRANSFORMADORES_MT, label: 'Transformadores MT', columns: [
        {Header: 'Cód. ID', accessor: 'cod_id'}, {Header: 'Circuito MT', accessor: 'ctmt'}, {Header: 'Potência (kVA)', accessor: 'pot_nom'}, {Header: 'Posto', accessor: 'posto'}
      ]},
      { id: 'ssdat', tableName: ASSET_TABLE_NAMES.SEGMENTOS_AT, label: 'Segmentos Rede AT', columns: [
        {Header: 'Cód. ID', accessor: 'cod_id'}, {Header: 'Circuito AT', accessor: 'ctat'}, {Header: 'Comprimento (m)', accessor: 'comp'}, {Header: 'Fases', accessor: 'fas_con'}, {Header: 'Poste De', accessor: 'pn_con_1'}, {Header: 'Poste Para', accessor: 'pn_con_2'}
      ]},
      { id: 'unseat', tableName: ASSET_TABLE_NAMES.SECCIONADORES_AT, label: 'Seccionadores AT', columns: [
        {Header: 'Cód. ID', accessor: 'cod_id'}, {Header: 'Tipo Unidade', accessor: 'tip_unid'}, {Header: 'Posição Normal', accessor: 'p_n_ope'}, {Header: 'Subestação', accessor: 'sub'}
      ]},
    ], []);

    const columnLinks = {
        'pn_con_1': { targetTab: 'postes', filterColumn: 'COD_ID' },
        'pn_con_2': { targetTab: 'postes', filterColumn: 'COD_ID' },
    };

    const activeTabConfig = tabsConfig.find(t => t.id === activeTab);
    const { data, isLoading, error, refetch } = useFetchData(activeTabConfig.tableName, { filters: localFilter });

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setLocalFilter(null);
    }
    
    const handleAddNew = () => {
        setModalState({
            isOpen: true,
            mode: 'add',
            asset: null,
            tableName: activeTabConfig.tableName,
            columns: activeTabConfig.columns,
            refetch
        });
    };

    const handleEdit = (asset) => {
        setModalState({
            isOpen: true,
            mode: 'edit',
            asset: asset,
            tableName: activeTabConfig.tableName,
            columns: activeTabConfig.columns,
            refetch
        });
    };

    const handleDelete = async (asset) => {
        if (window.confirm(`Tem certeza que deseja apagar o ativo ${asset.COD_ID || asset.cod_id || asset.OBJECTID || asset.id}?`)) {
            const idKey = asset.id ? 'id' : 'OBJECTID';
            const idValue = asset[idKey];
            const { error } = await supabase.from(activeTabConfig.tableName).delete().eq(idKey, idValue);
            if (error) {
                alert(`Erro ao apagar: ${error.message}`);
            } else {
                alert('Ativo apagado com sucesso!');
                refetch();
            }
        }
    };
    
    const handleSave = () => {
        setModalState({ isOpen: false, mode: 'add', asset: null, tableName: '', columns: [], refetch: () => {} });
        refetch();
    };

    const handleCancel = () => {
        setModalState({ isOpen: false, mode: 'add', asset: null, tableName: '', columns: [], refetch: () => {} });
    };

    return (
        <div className="content-area">
            <div className="page-header">
                <div>
                    <h3>Inventário de Ativos (BDGD)</h3>
                    <p>Navegue e gerencie os diferentes tipos de ativos da rede da distribuidora.</p>
                </div>
                 <button className="btn-primary" onClick={handleAddNew}>
                    <Icon path={ICONS.add} />
                    Adicionar Novo Ativo
                </button>
            </div>
            <Card>
                <div className="tabs-nav">
                    {tabsConfig.map(tab => (
                        <button key={tab.id} onClick={() => handleTabClick(tab.id)} className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="tab-content">
                    {localFilter && <button className="btn-secondary" style={{marginBottom: '1rem'}} onClick={() => setLocalFilter(null)}>Limpar filtro e mostrar todos</button>}
                    <Table 
                        columns={activeTabConfig.columns} 
                        data={data}
                        isLoading={isLoading}
                        error={error}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onRowClick={onSelectAssetForMap}
                        onLinkClick={onNavigateToAsset}
                        columnLinks={columnLinks}
                    />
                </div>
            </Card>
            <Modal
                isOpen={modalState.isOpen}
                onClose={handleCancel}
                title={modalState.mode === 'edit' ? `Editar Ativo: ${modalState.asset?.COD_ID || modalState.asset?.cod_id}` : `Adicionar Novo Ativo`}
            >
                <AssetForm
                    asset={modalState.asset}
                    columns={modalState.columns}
                    tableName={modalState.tableName}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
                 {modalState.mode === 'edit' && modalState.tableName === ASSET_TABLE_NAMES.POSTES && modalState.asset && (
                    <RelatedSegments asset={modalState.asset} />
                )}
            </Modal>
        </div>
    );
};

const OperatorDetails = ({ municipio, selectedUf }) => {
    const { 
        data: operatorData, 
        isLoading, 
        error 
    } = useFetchRpc('get_operator_details_by_municipio', { 
        municipio_param: municipio.Municipio,
        uf_param: selectedUf 
    });

    const columns = useMemo(() => [
        { Header: 'Operadora', accessor: 'Empresa' },
        { Header: 'Acessos', accessor: 'Acessos', Cell: (row) => (row.Acessos ? row.Acessos.toLocaleString() : '0') },
    ], []);
    
    if (isLoading) return <LoadingSpinner message="Carregando operadoras..." />;
    if (error) return <ErrorMessage title="Erro ao carregar operadoras" errorObj={error} />;


    return (
        <>
            <h4 className="card-title">Operadoras em {municipio.Municipio}</h4>
            <Table columns={columns} data={operatorData} isLoading={isLoading} error={error} />
        </>
    );
};

const GeminiChatPrototype = ({ municipio }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (municipio) {
            setMessages([{
                sender: 'ai',
                text: `Olá! Sou seu assistente de IA. Faça uma pergunta sobre os dados de ${municipio.Municipio}.`
            }]);
        }
    }, [municipio]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        setTimeout(() => {
            const aiResponse = {
                sender: 'ai',
                text: 'Esta é uma resposta simulada da IA. A funcionalidade completa para interagir com o Gemini será implementada em breve.'
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="chat-container">
            <h4 className="card-title">Análise com IA (Protótipo)</h4>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <p>{msg.text}</p>
                    </div>
                ))}
                {isLoading && (
                    <div className="message ai">
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte sobre os dados..."
                    disabled={isLoading}
                    aria-label="Faça uma pergunta sobre os dados"
                />
                <button type="submit" disabled={isLoading} aria-label="Enviar pergunta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
            </form>
        </div>
    );
};


const AcessosModule = () => {
    const ufs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
    const [selectedUf, setSelectedUf] = useState('SP');
    const [selectedMunicipio, setSelectedMunicipio] = useState(null);
    
    const { 
        data: summaryData, 
        isLoading: isLoadingSummary, 
        error: errorSummary 
    } = useFetchRpc('get_municipio_summary', { uf_param: selectedUf });
    
    useEffect(() => {
        setSelectedMunicipio(null);
    }, [selectedUf]);
    
    const summaryTableColumns = useMemo(() => [
        { Header: 'Município', accessor: 'Municipio' },
        { Header: 'Operadoras', accessor: 'numOperadoras', Cell: (row) => row.numOperadoras.toLocaleString() },
        { Header: 'Total de Acessos', accessor: 'totalAcessos', Cell: (row) => (row.totalAcessos ? row.totalAcessos.toLocaleString() : '0') },
    ], []);

    return (
        <div className="content-area">
            <div className="page-header">
                <div>
                    <h3>Acessos por Município</h3>
                    <p>Análise da quantidade de acessos e operadoras por município.</p>
                </div>
                <div className="uf-filter-container">
                    <label htmlFor="uf-select">Selecione uma UF:</label>
                    <select id="uf-select" value={selectedUf} onChange={e => setSelectedUf(e.target.value)}>
                        {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="acessos-layout">
                <Card className="acessos-panel">
                    {errorSummary && <ErrorMessage title="Erro ao carregar dados" errorObj={errorSummary} />}
                    {!errorSummary && (
                         <Table 
                            columns={summaryTableColumns} 
                            data={summaryData}
                            isLoading={isLoadingSummary}
                            onRowClick={setSelectedMunicipio}
                        />
                    )}
                </Card>
                
                {selectedMunicipio && (
                    <>
                        <Card className="acessos-panel" key={`${selectedMunicipio.Municipio}-details`}>
                            <OperatorDetails municipio={selectedMunicipio} selectedUf={selectedUf} />
                        </Card>
                        <Card className="acessos-panel chat-panel" key={`${selectedMunicipio.Municipio}-chat`}>
                           <GeminiChatPrototype municipio={selectedMunicipio} />
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

const PlaceholderModule = ({ title, description }) => (
    <div className="content-area">
        <div className="page-header"><h3>{title}</h3></div>
        <Card>
            <div style={{textAlign: 'center', padding: '2rem'}}>
                <Icon path={ICONS.info} />
                <p style={{marginTop: '1rem', fontSize: '1.1rem', color: 'var(--dark-gray)'}}>{description}</p>
            </div>
        </Card>
    </div>
);


// ===================================================================================
// COMPONENTE PRINCIPAL DA APLICAÇÃO
// ===================================================================================

const App = () => {
    const [activeModule, setActiveModule] = useState('dashboard');
    const [selectedAssetForMap, setSelectedAssetForMap] = useState(null);
    const [isMapPanelOpen, setIsMapPanelOpen] = useState(false);
    const [activeAssetFilter, setActiveAssetFilter] = useState(null);
    const supabaseClient = useSupabase();

    if (!supabaseClient) {
        return <ConfigError error={{ message: "As credenciais do Supabase (URL e Chave) não foram definidas no arquivo index.tsx."}} />;
    }

    const handleSelectAssetForMap = useCallback((asset) => {
        setSelectedAssetForMap(asset);
        setIsMapPanelOpen(true);
    }, []);

    const handleCloseMapPanel = useCallback(() => {
        setIsMapPanelOpen(false);
    }, []);

    const handleNavigateToAsset = useCallback((linkConfig, value) => {
        setActiveModule('assets');
        setActiveAssetFilter({
            tabId: linkConfig.targetTab,
            filter: { column: linkConfig.filterColumn, value: value }
        });
    }, []);

    const handleFilterConsumed = useCallback(() => {
        setActiveAssetFilter(null);
    }, []);

    const renderModule = () => {
        switch (activeModule) {
            case 'dashboard': return <DashboardModule onSelectAssetForMap={handleSelectAssetForMap} />;
            case 'gis': return <GisModule />;
            case 'assets': return <AssetsModule onSelectAssetForMap={handleSelectAssetForMap} onNavigateToAsset={handleNavigateToAsset} activeFilter={activeAssetFilter} onFilterConsumed={handleFilterConsumed} />;
            case 'acessos': return <AcessosModule />;
            case 'alerts': return <PlaceholderModule title="Alertas de Inconformidade" description="Este módulo exibirá alertas sobre irregularidades, como ISPs sem contrato, inadimplência e projetos defasados." />;
            case 'business': return <PlaceholderModule title="Novos Negócios" description="Este módulo apresentará oportunidades de negócio, como serviços de utilidade pública (iluminação, sinalização), IoT e conectividade adicional." />;
            case 'comms': return <PlaceholderModule title="Comunicação e Regularização" description="Ferramentas para gestão de ISPs (com ou sem contrato), acompanhamento de SLAs e regularização de ocupação." />;
            case 'admin': return <PlaceholderModule title="Administração" description="Configurações do sistema, gestão de usuários e permissões estarão disponíveis aqui." />;
            default: return <DashboardModule onSelectAssetForMap={handleSelectAssetForMap} />;
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
        { id: 'gis', label: 'GIS (ANEEL BDGD)', icon: ICONS.gis },
        { id: 'assets', label: 'Ativos', icon: ICONS.assets },
        { id: 'acessos', label: 'Acessos/Município', icon: ICONS.network },
        { id: 'alerts', label: 'Alertas', icon: ICONS.alert },
        { id: 'business', label: 'Novos Negócios', icon: ICONS.business },
        { id: 'comms', label: 'Comunicação', icon: ICONS.comms },
        { id: 'admin', label: 'Admin', icon: ICONS.admin }
    ];

    return (
        <div className="app-layout">
            <header className="app-header">
                <div className="header-logo"><h1>InfraGrid</h1></div>
                <nav className="header-nav">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id} className={activeModule === item.id ? 'active' : ''}>
                                <a href="#" onClick={(e) => { e.preventDefault(); setActiveModule(item.id); }}>
                                    <Icon path={item.icon} />
                                    {item.label}
                                  </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>
            <main className="main-content">
                {renderModule()}
            </main>
            <SideMapPanel asset={selectedAssetForMap} isOpen={isMapPanelOpen} onClose={handleCloseMapPanel} />
        </div>
    );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
