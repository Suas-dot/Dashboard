// Variables globales
let empleadosFiltrados = [];
let charts = {};

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    empleadosFiltrados = [...window.empleadosData];
    initializeFilters();
    updateDashboard();
    createCharts();
});

// Inicializar filtros
function initializeFilters() {
    const areas = [...new Set(window.empleadosData.map(e => e.area))].sort();
    const gerencias = [...new Set(window.empleadosData.map(e => e.gerencia))].sort();

    const areaSelect = document.getElementById('filterArea');
    const gerenciaSelect = document.getElementById('filterGerencia');

    areas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        areaSelect.appendChild(option);
    });

    gerencias.forEach(gerencia => {
        const option = document.createElement('option');
        option.value = gerencia;
        option.textContent = gerencia;
        gerenciaSelect.appendChild(option);
    });
}

// Aplicar filtros
function applyFilters() {
    const areaFilter = document.getElementById('filterArea').value;
    const gerenciaFilter = document.getElementById('filterGerencia').value;
    const tipoFilter = document.getElementById('filterTipo').value;
    const classFilter = document.getElementById('filterClassificacion').value;

    empleadosFiltrados = window.empleadosData.filter(emp => {
        const matchArea = !areaFilter || emp.area === areaFilter;
        const matchGerencia = !gerenciaFilter || emp.gerencia === gerenciaFilter;
        const matchTipo = !tipoFilter || emp.tipoRestriccion === tipoFilter;

        // Filtro por Clasificación de Nivel de Acción
        let matchClass = true;
        if (classFilter === 'Inmediata') {
            matchClass = emp.restriccionesInmediatas && emp.restriccionesInmediatas.length > 0;
        } else if (classFilter === 'MedioPlazo') {
            matchClass = emp.restriccionesMedioPlazo && emp.restriccionesMedioPlazo.length > 0;
        } else if (classFilter === 'Definitiva') {
            matchClass = emp.restriccionesDefinitivas && emp.restriccionesDefinitivas.length > 0;
        }

        return matchArea && matchGerencia && matchTipo && matchClass;
    });

    updateDashboard();
    updateCharts();
}

// Resetear filtros
function resetFilters() {
    document.getElementById('filterArea').value = '';
    document.getElementById('filterGerencia').value = '';
    document.getElementById('filterTipo').value = '';
    document.getElementById('filterClassificacion').value = '';
    document.getElementById('searchInput').value = '';
    empleadosFiltrados = [...window.empleadosData];
    updateDashboard();
    updateCharts();
}

// Actualizar dashboard
function updateDashboard() {
    updateKPIs();
    updateTable();
}

// Actualizar KPIs
function updateKPIs() {
    const total = empleadosFiltrados.length;
    const temporales = empleadosFiltrados.filter(e => e.tipoRestriccion === 'Temporal').length;
    const definitivas = empleadosFiltrados.filter(e => e.tipoRestriccion === 'Definitiva').length;
    const percentage = total > 0 ? Math.round((temporales / total) * 100) : 0;

    document.getElementById('kpiTotal').textContent = total;
    document.getElementById('kpiTemporal').textContent = temporales;
    document.getElementById('kpiDefinitiva').textContent = definitivas;
    document.getElementById('kpiPercentage').textContent = percentage + '%';
}

// Actualizar tabla
function updateTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    empleadosFiltrados.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.codigo}</td>
            <td>${emp.nombre}</td>
            <td><span class="badge ${emp.tipoRestriccion.toLowerCase()}">${emp.tipoRestriccion}</span></td>
            <td>${emp.area}</td>
            <td>${emp.gerencia}</td>
            <td>${formatDate(emp.fechaInicio)}</td>
            <td>${emp.fechaFin ? formatDate(emp.fechaFin) : 'Indefinida'}</td>
            <td><button class="view-btn" onclick='showDetails(${JSON.stringify(emp)})'>Ver Detalles</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Buscar en tabla
function searchTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (searchTerm === '') {
        applyFilters();
        return;
    }

    const areaFilter = document.getElementById('filterArea').value;
    const gerenciaFilter = document.getElementById('filterGerencia').value;
    const tipoFilter = document.getElementById('filterTipo').value;

    empleadosFiltrados = window.empleadosData.filter(emp => {
        const matchArea = !areaFilter || emp.area === areaFilter;
        const matchGerencia = !gerenciaFilter || emp.gerencia === gerenciaFilter;
        const matchTipo = !tipoFilter || emp.tipoRestriccion === tipoFilter;
        const matchSearch = emp.codigo.toLowerCase().includes(searchTerm) ||
            emp.nombre.toLowerCase().includes(searchTerm);
        return matchArea && matchGerencia && matchTipo && matchSearch;
    });

    updateDashboard();
    updateCharts();
}

// Ordenar tabla
let sortDirection = {};
function sortTable(columnIndex) {
    const columns = ['codigo', 'nombre', 'tipoRestriccion', 'area', 'gerencia', 'fechaInicio', 'fechaFin'];
    const column = columns[columnIndex];

    if (!sortDirection[column]) {
        sortDirection[column] = 'asc';
    } else {
        sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
    }

    empleadosFiltrados.sort((a, b) => {
        let valA = a[column] || '';
        let valB = b[column] || '';

        if (sortDirection[column] === 'asc') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });

    updateTable();
}

// Crear gráficos
function createCharts() {
    createTipoChart();
    createAreaChart();
    createGerenciaChart();
}

// Gráfico de tipo
function createTipoChart() {
    const ctx = document.getElementById('tipoChart').getContext('2d');
    const temporales = empleadosFiltrados.filter(e => e.tipoRestriccion === 'Temporal').length;
    const definitivas = empleadosFiltrados.filter(e => e.tipoRestriccion === 'Definitiva').length;

    if (charts.tipo) {
        charts.tipo.destroy();
    }

    charts.tipo = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Temporales', 'Definitivas'],
            datasets: [{
                data: [temporales, definitivas],
                backgroundColor: ['#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const tipo = index === 0 ? 'Temporal' : 'Definitiva';
                    document.getElementById('filterTipo').value = tipo;
                    applyFilters();
                }
            }
        }
    });
}

// Gráfico de área
function createAreaChart() {
    const ctx = document.getElementById('areaChart').getContext('2d');
    const areaData = {};

    empleadosFiltrados.forEach(emp => {
        areaData[emp.area] = (areaData[emp.area] || 0) + 1;
    });

    const labels = Object.keys(areaData).sort();
    const data = labels.map(label => areaData[label]);

    if (charts.area) {
        charts.area.destroy();
    }

    charts.area = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Restricciones',
                data: data,
                backgroundColor: '#6366f1',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const area = labels[index];
                    document.getElementById('filterArea').value = area;
                    applyFilters();
                }
            }
        }
    });
}

// Gráfico de gerencia
function createGerenciaChart() {
    const ctx = document.getElementById('gerenciaChart').getContext('2d');
    const gerenciaData = {};

    empleadosFiltrados.forEach(emp => {
        gerenciaData[emp.gerencia] = (gerenciaData[emp.gerencia] || 0) + 1;
    });

    const labels = Object.keys(gerenciaData).sort();
    const data = labels.map(label => gerenciaData[label]);

    if (charts.gerencia) {
        charts.gerencia.destroy();
    }

    charts.gerencia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Restricciones',
                data: data,
                backgroundColor: '#8b5cf6',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const gerencia = labels[index];
                    document.getElementById('filterGerencia').value = gerencia;
                    applyFilters();
                }
            }
        }
    });
}

// Actualizar gráficos
function updateCharts() {
    createTipoChart();
    createAreaChart();
    createGerenciaChart();
}

// Mostrar detalles
function showDetails(empleado) {
    const modal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `Detalles: ${empleado.nombre}`;

    modalBody.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Código:</div>
            <div class="detail-value">${empleado.codigo}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Nombre Completo:</div>
            <div class="detail-value">${empleado.nombre}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Tipo de Restricción:</div>
            <div class="detail-value"><span class="badge ${empleado.tipoRestriccion.toLowerCase()}">${empleado.tipoRestriccion}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Área:</div>
            <div class="detail-value">${empleado.area}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Gerencia:</div>
            <div class="detail-value">${empleado.gerencia}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Fecha de Inicio:</div>
            <div class="detail-value">${formatDate(empleado.fechaInicio)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Fecha de Fin:</div>
            <div class="detail-value">${empleado.fechaFin ? formatDate(empleado.fechaFin) : 'Indefinida'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Diagnóstico:</div>
            <div class="detail-value">${empleado.diagnostico}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Restricciones:</div>
            <div class="detail-value">
                ${(function () {
            let html = '';
            if (empleado.restriccionesInmediatas && empleado.restriccionesInmediatas.length > 0) {
                html += `<strong>⚠️ Acciones Inmediatas:</strong><ul style="margin: 5px 0 10px 0; padding-left: 20px;">
                            ${empleado.restriccionesInmediatas.map(r => `<li>${r}</li>`).join('')}</ul>`;
            }
            if (empleado.restriccionesMedioPlazo && empleado.restriccionesMedioPlazo.length > 0) {
                html += `<strong>🗓️ Medio Plazo:</strong><ul style="margin: 5px 0 10px 0; padding-left: 20px;">
                            ${empleado.restriccionesMedioPlazo.map(r => `<li>${r}</li>`).join('')}</ul>`;
            }
            if (empleado.restriccionesDefinitivas && empleado.restriccionesDefinitivas.length > 0) {
                html += `<strong>🚫 Definitivas:</strong><ul style="margin: 5px 0 10px 0; padding-left: 20px;">
                            ${empleado.restriccionesDefinitivas.map(r => `<li>${r}</li>`).join('')}</ul>`;
            }
            // Fallback
            if (!html && empleado.restricciones) {
                html = empleado.restricciones;
            }
            return html;
        })()}
            </div >
        </div >
    `;

    modal.style.display = 'block';
}

// Cerrar modal
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate() + 1).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} /${month}/${year} `;
}

// Exportar a Excel
function exportToExcel() {
    try {
        console.log('Iniciando exportación a Excel...');
        console.log('Empleados a exportar:', empleadosFiltrados.length);

        // Verificar que XLSX esté disponible
        if (typeof XLSX === 'undefined') {
            alert('Error: La librería de Excel no está cargada. Por favor, recargue la página.');
            return;
        }

        // Obtener claves de restricciones detalladas (del primer empleado)
        const restrictionKeys = empleadosFiltrados.length > 0 && empleadosFiltrados[0].restriccionesDetalle
            ? Object.keys(empleadosFiltrados[0].restriccionesDetalle)
            : [];

        // Preparar datos para exportar con TODOS los campos
        const dataToExport = empleadosFiltrados.map(emp => {
            const row = {
                'Código': emp.codigo,
                'Nombre Completo': emp.nombre,
                'Tipo de Restricción': emp.tipoRestriccion,
                'Área': emp.area,
                'Gerencia': emp.gerencia,
                'Puesto de Trabajo': emp.puesto || 'No especificado',
                'Género': emp.genero || 'No especificado',
                'Edad': emp.edad || 'N/A',
                'Fecha Ingreso': emp.fechaIngreso !== 'N/A' ? formatDate(emp.fechaIngreso) : 'N/A',
                'Fecha Inicio Restricción': formatDate(emp.fechaInicio),
                'Fecha Fin Restricción': emp.fechaFin ? formatDate(emp.fechaFin) : 'Indefinida',
                'Discapacidad': emp.discapacidad || 'No',
                'Diagnóstico': emp.diagnostico || 'No especificado',
                'Resumen Restricciones': emp.restricciones || 'No especificado'
            };

            // Agregar columnas detalladas
            restrictionKeys.forEach(key => {
                row[key] = emp.restriccionesDetalle && emp.restriccionesDetalle[key] ? 'VERDADERO' : 'FALSO';
            });

            return row;
        });

        console.log('Datos preparados:', dataToExport.length, 'registros');

        // Crear libro de trabajo
        const wb = XLSX.utils.book_new();

        // Crear hoja de datos
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // Ajustar ancho de columnas base
        const baseColWidths = [
            { wch: 10 },  // Código
            { wch: 35 },  // Nombre Completo
            { wch: 18 },  // Tipo de Restricción
            { wch: 30 },  // Área
            { wch: 25 },  // Gerencia
            { wch: 30 },  // Puesto de Trabajo
            { wch: 12 },  // Género
            { wch: 8 },   // Edad
            { wch: 15 },  // Fecha Ingreso
            { wch: 18 },  // Fecha Inicio Restricción
            { wch: 18 },  // Fecha Fin Restricción
            { wch: 15 },  // Discapacidad
            { wch: 40 },  // Diagnóstico
            { wch: 50 },  // Resumen Restricciones
        ];

        // Agregar anchos para columnas dinámicas (aprox 20 chars)
        const dynamicColWidths = restrictionKeys.map(() => ({ wch: 25 }));

        ws['!cols'] = [...baseColWidths, ...dynamicColWidths];

        // Agregar hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Restricciones Laborales');

        // Crear hoja de resumen
        const temporales = empleadosFiltrados.filter(e => e.tipoRestriccion === 'Temporal').length;
        const definitivas = empleadosFiltrados.filter(e => e.tipoRestriccion === 'Definitiva').length;

        const resumen = [
            { 'Indicador': 'Total de Restricciones', 'Valor': empleadosFiltrados.length },
            { 'Indicador': 'Restricciones Temporales', 'Valor': temporales },
            { 'Indicador': 'Restricciones Definitivas', 'Valor': definitivas },
            { 'Indicador': '% Temporales', 'Valor': empleadosFiltrados.length > 0 ? `${((temporales / empleadosFiltrados.length) * 100).toFixed(1)}% ` : '0%' },
            { 'Indicador': '% Definitivas', 'Valor': empleadosFiltrados.length > 0 ? `${((definitivas / empleadosFiltrados.length) * 100).toFixed(1)}% ` : '0%' }
        ];

        const wsResumen = XLSX.utils.json_to_sheet(resumen);
        wsResumen['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

        // Crear hoja de resumen por área
        const areaStats = {};
        empleadosFiltrados.forEach(emp => {
            if (!areaStats[emp.area]) {
                areaStats[emp.area] = { Temporal: 0, Definitiva: 0 };
            }
            areaStats[emp.area][emp.tipoRestriccion]++;
        });

        const resumenArea = Object.keys(areaStats).sort().map(area => ({
            'Área': area,
            'Temporales': areaStats[area].Temporal || 0,
            'Definitivas': areaStats[area].Definitiva || 0,
            'Total': (areaStats[area].Temporal || 0) + (areaStats[area].Definitiva || 0)
        }));

        if (resumenArea.length > 0) {
            const wsArea = XLSX.utils.json_to_sheet(resumenArea);
            wsArea['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, wsArea, 'Resumen por Área');
        }

        // Descargar archivo (Método robusto usando Blob)
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `Restricciones_Laborales_Plasticaucho_${fecha}.xlsx`;

        console.log('Generando archivo:', fileName);

        // Generar archivo binario
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Crear Blob
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Crear elemento de enlace para descarga forzada
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        document.body.appendChild(anchor);
        anchor.href = url;
        anchor.download = fileName;

        // Simular clic
        anchor.click();

        // Limpiar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);

        // Mostrar mensaje de éxito
        alert(`✅ Archivo generado exitosamente!\n\n📊 ${empleadosFiltrados.length} empleados exportados\n📁 Archivo: ${fileName} \n\nLa descarga debería comenzar automáticamente.`);

        console.log('Exportación completada exitosamente');

    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        alert(`❌ Error al exportar a Excel: \n\n${error.message} \n\nPor favor, intente nuevamente o contacte al administrador.`);
    }
}

