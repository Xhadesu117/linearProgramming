const btnGenerar = document.getElementById('btnGenerar');
const btnAgregarRestriccion = document.getElementById('btnAgregarRestriccion');
const form = document.getElementById('problema-form');
const camposObjetivo = document.getElementById('campos-objetivo');
const restriccionesContainer = document.getElementById('restriccionesContainer');
const resultadoEl = document.getElementById('resultado');

let restrictionCounter = 0;
let myChart = null;

// --- Genera campos ---
function generarCamposObjetivo() {
    // ... (El resto de esta función es idéntica a tu original)
    const n = parseInt(document.getElementById('numVariables').value) || 0;
    if (n <= 0 || n > 10) {
        camposObjetivo.innerHTML = '<p class="text-danger">Define un número de variables entre 1 y 10.</p>';
        return;
    }

    // LEER Y GUARDAR VALORES ANTIGUOS DE Z (Función Objetivo)
    const oldObjInputs = camposObjetivo.querySelectorAll('.obj-coeff');
    const oldObjValues = {};
    oldObjInputs.forEach(input => {
        const varName = input.dataset.var;
        if (varName) {
            oldObjValues[varName] = input.value;
        }
    });

    // Generar HTML de Función Objetivo
    camposObjetivo.innerHTML = '';
    let htmlObjetivo = `<div class="d-flex flex-wrap gap-2 align-items-end w-100">`;

    for (let i = 1; i <= n; i++) {
        const varName = `x${i}`;
        const defaultValue = (i === 1 ? '1' : '0');
        const value = oldObjValues[varName] !== undefined ? oldObjValues[varName] : defaultValue;

        htmlObjetivo += `
        <div class="variable-bloque d-flex flex-column flex-grow-1" style="min-width: 60px;">
            <label for="obj-x${i}" class="fw-bold mb-1 text-center">${varName}</label>
            <input type="number" class="form-control obj-coeff text-center" 
                   id="obj-x${i}" value="${value}" data-var="${varName}">
        </div>
    `;
    }
    htmlObjetivo += '</div>';
    camposObjetivo.innerHTML = htmlObjetivo;

    // Actualizar restricciones existentes PRESERVANDO VALORES
    const allRestrictions = document.querySelectorAll('.restriction-block');

    if (allRestrictions.length === 0) {
        addRestrictionRow();
    } else {
        allRestrictions.forEach(block => {
            const blockId = block.id.split('-')[1];
            const variableContainer = block.querySelector('.variable-inputs-container');
            if (!variableContainer) return;

            // LEER Y GUARDAR VALORES ANTIGUOS
            const oldInputs = variableContainer.querySelectorAll('.const-coeff');
            const oldValues = {};
            oldInputs.forEach(input => {
                const varName = input.dataset.var;
                oldValues[varName] = input.value;
            });

            // RE-GENERAR HTML, USANDO VALORES ANTIGUOS
            let newVariablesHtml = '';
            for (let i = 1; i <= n; i++) {
                const varName = `x${i}`;
                const value = oldValues[varName] !== undefined ? oldValues[varName] : '0';

                newVariablesHtml += `
                <div class="variable-bloque d-flex flex-column flex-grow-1" style="min-width: 60px;">
                    <label for="const-${blockId}-x${i}" class="fw-bold mb-1 text-center">${varName}</label>
                    <input type="number" class="form-control const-coeff text-center" 
                           id="const-${blockId}-x${i}" value="${value}" data-var="${varName}"> 
                </div>
            `;
                if (i < n) {
                    newVariablesHtml += '<span class="fw-bold fs-5 mb-1 flex-shrink-0">+</span>';
                }
            }

            variableContainer.innerHTML = newVariablesHtml;

            // Volver a conectar los listeners a los NUEVOS inputs
            const newInputs = variableContainer.querySelectorAll('input.const-coeff');
            newInputs.forEach(input => {
                input.addEventListener('input', () => updateRestrictionOutput(blockId));
            });

            updateRestrictionOutput(blockId);
        });
    }
}

// --- Añade una nueva fila de restricción ---
function addRestrictionRow() {
    // ... (El resto de esta función es idéntica a tu original)
    restrictionCounter++;
    const currentRestrictionId = restrictionCounter;
    const n = parseInt(document.getElementById('numVariables').value) || 0;

    if (n === 0) {
        alert("Por favor, define el número de variables primero.");
        return;
    }

    let restrictionHtml = `
        <div class="restriction-block border rounded p-3 mb-3" id="restriction-${currentRestrictionId}">
            
            <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-danger btn-borrar" aria-label="Close"
                        data-target-id="${currentRestrictionId}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>

            <div class="d-flex flex-wrap gap-2 align-items-end w-100 mb-3 variable-inputs-container mt-2">
    `;


    for (let i = 1; i <= n; i++) {
        restrictionHtml += `
        <div class="variable-bloque d-flex flex-column flex-grow-1" style="min-width: 60px;">
            <label for="const-${currentRestrictionId}-x${i}" class="fw-bold mb-1 text-center">x${i}</label>
            <input type="number" class="form-control const-coeff text-center" 
                   id="const-${currentRestrictionId}-x${i}" value="0" data-var="x${i}">
        </div>
    `;
        if (i < n) {
            restrictionHtml += '<span class="fw-bold fs-5 mb-1 flex-shrink-0">+</span>';
        }
    }
    restrictionHtml += '</div>';
    restrictionHtml += `
        <div class="d-flex gap-2 justify-content-center">
            <div style="min-width: 80px;">
                <select class="form-select const-op text-center" id="const-${currentRestrictionId}-op">
                    <option value="<=" selected>≤</option>
                    <option value=">=">≥</option>
                    <option value="=">=</option>
                </select>
            </div>
            <div style="min-width: 100px;">
                <input type="number" class="form-control const-rhs text-center" 
                       id="const-${currentRestrictionId}-rhs" value="0">
            </div>
        </div>
    `;
    restrictionHtml += `
        <div class="mt-3 p-2 bg-dark-subtle rounded text-center restriction-output" id="restriction-output-${currentRestrictionId}">
        </div>
    `;
    restrictionHtml += `</div>`;
    restriccionesContainer.insertAdjacentHTML('beforeend', restrictionHtml);

    const inputs = document.querySelectorAll(`#restriction-${currentRestrictionId} input, #restriction-${currentRestrictionId} select`);
    inputs.forEach(input => {
        input.addEventListener('input', () => updateRestrictionOutput(currentRestrictionId));
    });

    updateRestrictionOutput(currentRestrictionId);
}

// --- Actualiza el texto de una restricción ---
function updateRestrictionOutput(id) {
    // ... (El resto de esta función es idéntica a tu original)
    const outputEl = document.getElementById(`restriction-output-${id}`);
    if (!outputEl) return;

    const opSelect = document.getElementById(`const-${id}-op`);
    if (!opSelect) return;
    const opSymbol = opSelect.options[opSelect.selectedIndex].text;

    let terms = [];
    const restrictionBlock = document.getElementById(`restriction-${id}`);
    if (!restrictionBlock) return;

    const coeffInputs = restrictionBlock.querySelectorAll('.const-coeff');

    coeffInputs.forEach((coeffInput, index) => {
        const varNum = index + 1;
        const valNum = parseFloat(coeffInput.value) || 0;

        if (valNum !== 0) {
            if (valNum === 1) terms.push(`x${varNum}`);
            else if (valNum === -1) terms.push(`-x${varNum}`);
            else terms.push(`${valNum}x${varNum}`);
        }x
    });

    const rhsInput = document.getElementById(`const-${id}-rhs`);
    if (!rhsInput) return;
    const rhsValue = parseFloat(rhsInput.value) || 0;

    let restrictionText = terms.join(' + ').replace(/\+ -/g, '- ');
    if (restrictionText === '') {
        restrictionText = '0';
    }

    outputEl.innerHTML = `${restrictionText} ${opSymbol} ${rhsValue}`;
}

// --- Genera Gráfico ---
async function generarGrafico(model, results) {
    const ctx = document.getElementById('myChart').getContext('2d');

    // Si ya existe un gráfico, destruirlo para crear uno nuevo
    if (myChart) {
        myChart.destroy();
    }

    const datasets = [];
    let maxCoord = 10; // Un valor inicial por defecto

    // --- 1. Calcular rango del gráfico (maxX, maxY) ---
    // Buscamos los interceptos con los ejes para saber qué tan grande hacer el gráfico
    let intercepts = [];
    for (const cName in model.constraints) {
        const constraint = model.constraints[cName];
        // Asumimos 'x1' es 'x' y 'x2' es 'y'
        const A = model.variables.x1 ? (model.variables.x1[cName] || 0) : 0;
        const B = model.variables.x2 ? (model.variables.x2[cName] || 0) : 0;
        const C = constraint.max ?? constraint.min ?? constraint.equal ?? 0;

        // Intercepto X (cuando x2=0): x1 = C / A
        if (A !== 0) intercepts.push(Math.abs(C / A));
        // Intercepto Y (cuando x1=0): x2 = C / B
        if (B !== 0) intercepts.push(Math.abs(C / B));
    }
    
    // Incluir el punto óptimo en el cálculo del rango
    if (results.x1) intercepts.push(parseFloat(results.x1));
    if (results.x2) intercepts.push(parseFloat(results.x2));

    if (intercepts.length > 0) {
        // Usamos Math.max para filtrar NaN/Infinity y encontrar el valor más grande
        const validIntercepts = intercepts.filter(v => isFinite(v) && !isNaN(v) && v > 0);
        if (validIntercepts.length > 0) {
             maxCoord = Math.max(10, ...validIntercepts) * 1.2; // Añade un 20% de margen
        }
    }
    // Redondear al entero más cercano
    const plotMax = Math.ceil(maxCoord);


    // --- 2. Crear datasets para las líneas de restricción ---
    let colorIndex = 0;
    const colors = ['#007bff', '#6f42c1', '#dc3545', '#fd7e14', '#20c997', '#6610f2'];

    for (const cName in model.constraints) {
        const constraint = model.constraints[cName];
        const A = model.variables.x1 ? (model.variables.x1[cName] || 0) : 0;
        const B = model.variables.x2 ? (model.variables.x2[cName] || 0) : 0;
        const C = constraint.max ?? constraint.min ?? constraint.equal ?? 0;

        let lineData = [];
        let label = (model.variables.x1[cName] ? `${A}x1 + ` : '') + (model.variables.x2[cName] ? `${B}x2 = ${C}` : `${C}`);

        if (B !== 0) {
            // Ecuación estándar: y = (C - A*x) / B
            const y_at_x0 = (C - A * 0) / B;
            const y_at_xMax = (C - A * plotMax) / B;
            // Asegurarnos de no trazar puntos infinitos
            if (isFinite(y_at_x0) && isFinite(y_at_xMax)) {
                 lineData = [{x: 0, y: y_at_x0}, {x: plotMax, y: y_at_xMax}];
            }
        } else if (A !== 0) {
            // Línea vertical: x = C / A (B es 0)
            const x_val = C / A;
            if (isFinite(x_val)) {
                lineData = [{x: x_val, y: 0}, {x: x_val, y: plotMax}];
            }
        } else {
            // Ignorar restricciones como 0x1 + 0x2 = 0
            continue; 
        }

        if (lineData.length > 0) {
            datasets.push({
                type: 'line',
                label: `Restricción: ${label}`,
                data: lineData,
                borderColor: colors[colorIndex % colors.length],
                borderWidth: 2,
                fill: false,
                tension: 0, // Líneas rectas
                pointRadius: 0 // No mostrar puntos en la línea
            });
            colorIndex++;
        }
    }

    // --- 3. Añadir el punto de la solución óptima ---
    const optimalX = parseFloat(results.x1) || 0;
    const optimalY = parseFloat(results.x2) || 0;
    
    datasets.push({
        type: 'scatter',
        label: `Solución Óptima (Z=${results.result})`,
        data: [{ x: optimalX, y: optimalY }],
        backgroundColor: '#28a745', // Verde éxito
        pointRadius: 8,
        pointHoverRadius: 10
    });
    
    // --- 4. Crear el gráfico ---
    myChart = new Chart(ctx, {
        type: 'scatter', // Tipo base, pero los datasets lo sobreescriben
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Visualización del Problema (2 Variables)'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.type === 'scatter') {
                                return `Óptimo: (x1: ${context.parsed.x.toFixed(2)}, x2: ${context.parsed.y.toFixed(2)})`;
                            }
                            return context.dataset.label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'x1'
                    },
                    min: 0, // Asumimos no negatividad
                    max: plotMax // Límite calculado
                },
                y: {
                    title: {
                        display: true,
                        text: 'x2'
                    },
                    min: 0, // Asumimos no negatividad
                    max: plotMax // Límite calculado
                }
            }
        }
    });
}


// --- EVENT LISTENERS ---
btnGenerar.addEventListener('click', generarCamposObjetivo);
btnAgregarRestriccion.addEventListener('click', addRestrictionRow);

restriccionesContainer.addEventListener('click', function (event) {
    const deleteButton = event.target.closest('.btn-borrar');
    if (!deleteButton) return;

    const allRestrictions = document.querySelectorAll('.restriction-block');
    if (allRestrictions.length <= 1) {
        alert("Debes tener al menos una restricción.");
        return;
    }

    const targetId = deleteButton.dataset.targetId;
    const blockToDelete = document.getElementById('restriction-' + targetId);

    if (blockToDelete) {
        blockToDelete.remove();
    }
});

// --- Escucha el 'Submit' del formulario ---
form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // OBTENER Y LIMPIAR TODOS LOS CONTENEDORES DE RESULTADOS
    const resultadoEl = document.getElementById('resultado');
    const aumentadoEl = document.getElementById('modelo-aumentado-card');
    const iteracionesEl = document.getElementById('iteraciones-card');

    // --- MODIFICACIÓN: Ocultar el gráfico anterior ---
    const graficoContainer = document.getElementById('grafico-container');
    if (graficoContainer) graficoContainer.style.display = 'none';
    if (myChart) myChart.destroy(); // Destruir instancia anterior
    // --- FIN DE MODIFICACIÓN ---

    resultadoEl.innerHTML = `
        <div class="d-flex align-items-center justify-content-center">
            <strong role="status">Calculando...</strong>
            <div class="spinner-border ms-3" aria-hidden="true"></div>
        </div>`;
    aumentadoEl.innerHTML = '';
    iteracionesEl.innerHTML = '';

    // ... (El resto de la lógica de 'submit' es idéntica a tu original...)
    const model = { "optimize": "z", "opType": "max", "constraints": {}, "variables": {} };
    const n_objetivo = parseInt(document.getElementById('numVariables').value);
    const objCoeffs = document.querySelectorAll('.obj-coeff');
    for (let i = 0; i < n_objetivo; i++) {
        if (objCoeffs[i]) {
            const varName = `x${i + 1}`;
            model.variables[varName] = { "z": parseFloat(objCoeffs[i].value) || 0 };
        }
    }
    const restrictionBlocks = document.querySelectorAll('.restriction-block');
    restrictionBlocks.forEach((block, index) => {
        const constName = `c${index + 1}`;
        const rhs = parseFloat(block.querySelector('.const-rhs').value) || 0;
        const opValue = block.querySelector('.const-op').value;
        model.constraints[constName] = {};
        if (opValue === "<=") model.constraints[constName].max = rhs;
        else if (opValue === ">=") model.constraints[constName].min = rhs;
        else if (opValue === "=") model.constraints[constName].equal = rhs;
        const constCoeffs = block.querySelectorAll('.const-coeff');
        constCoeffs.forEach((coeffInput, i) => {
            const varName = `x${i + 1}`;
            if (!model.variables[varName]) model.variables[varName] = {};
            model.variables[varName][constName] = parseFloat(coeffInput.value) || 0;
        });
    });
    for (const varName in model.variables) {
        if (Object.keys(model.variables[varName]).length === 0) {
            delete model.variables[varName];
        }
    }

    try {
        let aumentadoHtml = '';
        const opType = model.opType === 'max' ? 'Maximizar' : 'Minimizar';
        const Z = model.optimize.toUpperCase();

        // Función Objetivo Original
        let terminosObj = [];
        for (const varName in model.variables) {
            if (model.variables[varName][model.optimize]) {
                terminosObj.push(`${model.variables[varName][model.optimize]}${varName}`);
            }
        }
        const funcObjOriginal = `${opType} ${Z} = ${terminosObj.join(" + ").replace(/\+ -/g, '- ')}`;
        aumentadoHtml += `<h6 class="card-subtitle mb-2 text-muted">Función Original:</h6>`;
        aumentadoHtml += `<p><strong>${funcObjOriginal}</strong></p>`;

        // Variables y Función Aumentada
        let terminosHolguraZ = [];
        let nombresHolgura = [];
        let slackCount = 0;
        let surplusCount = 0;

        Object.keys(model.constraints).forEach((cName, i) => {
            const constraint = model.constraints[cName];
            if (constraint.max !== undefined) { // Es <=, usa variable de Holgura (s)
                const sVar = `s${i + 1}`;
                terminosHolguraZ.push(`0${sVar}`); // Coeficiente 0 en Z
                nombresHolgura.push(sVar);
                slackCount++;
            } else if (constraint.min !== undefined) { // Es >=, usa variable de Exceso (e)
                const eVar = `e${i + 1}`;
                terminosHolguraZ.push(`0${eVar}`); // Coeficiente 0 en Z (simplificado)
                nombresHolgura.push(eVar);
                surplusCount++;
            }
        });

        const funcObjAumentada = `${funcObjOriginal} + ${terminosHolguraZ.join(" + ")}`;
        aumentadoHtml += `<h6 class="card-subtitle mb-2 mt-3 text-muted">Función Aumentada:</h6>`;
        aumentadoHtml += `<p><strong>${funcObjAumentada}</strong></p>`

        aumentadoHtml += `<h6 class="card-subtitle mb-2 mt-3 text-muted">Variables de Holgura - Exceso Agregadas:</h6>`;
        aumentadoHtml += `<p><strong>${nombresHolgura.join(" + ")}</strong></p>`;

        aumentadoHtml += `<h6 class="card-subtitle mb-2 mt-3 text-muted">Conteo de Variables:</h6>`;
        aumentadoHtml += `<p class="mb-0">Variables s (Holgura): <strong>${slackCount}</strong><br>Variables e (Exceso): <strong>${surplusCount}</strong></p>`;

        aumentadoEl.innerHTML = aumentadoHtml;

    } catch (e) {
        aumentadoEl.innerHTML = `<div class="alert alert-danger">Error al generar modelo aumentado: ${e.message}</div>`;
    }

    try {
        const response = await fetch('/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(model)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}. Respuesta: ${errorText.substring(0, 100)}...`);
        }

        const results = await response.json();

        // --- GENERAR TARJETA DE "ITERACIONES" ---
        let iteracionesHtml = '';

        iteracionesHtml += `
        <table class="table table-striped ">
            <thead>
                <tr><th>Iteración</th><th>Valor de Z</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td>1 (Inicial)</td>
                    <td>0</td>
                </tr>
                <tr>
                    <td><strong>Óptimo</strong></td>
                    <td><strong>${results.result}</strong></td>
                </tr>
            </tbody>
        </table>`;

        iteracionesEl.innerHTML = iteracionesHtml;

        // --- GENERAR "SOLUCIÓN FINAL" ---
        if (results.feasible) {
            let solucionHtml = ''
            solucionHtml += `<hr>`
            solucionHtml += `<div class='list-group-item d-flex justify-content-between align-items-center fs-5 mb-2'>
                <span class="h6">Solución Óptima</span>
                <span class="h6 badge bg-success">${results.result}</span>
            </div>`;
            solucionHtml += "<h6 class='text-muted'>Valores de las variables:</h6>";
            solucionHtml += "<ul class='list-group list-group-flush'>";
            for (const varName in model.variables) {
                solucionHtml += `
            <li class='list-group-item d-flex justify-content-between align-items-center fs-5'>
                <span class="fw-bold">${varName}</span>
                <span class="badge bg-secondary rounded-pill">${results[varName] || 0}</span>
            </li>`;
            }
            solucionHtml += "</ul>";
            resultadoEl.innerHTML = solucionHtml;

            // --- MODIFICACIÓN: Llamar al gráfico si es de 2 variables ---
            const n_vars = parseInt(document.getElementById('numVariables').value);
            if (n_vars === 2 && graficoContainer) {
                graficoContainer.style.display = 'block';
                await generarGrafico(model, results);
            }
            // --- FIN DE MODIFICACIÓN ---

        } else {
            resultadoEl.innerHTML = "<h4 class='text-danger'>No se encontró una solución factible.</h4> <p>Revisa tus restricciones.</p>";
            iteracionesEl.innerHTML = ''; // Borra la tabla de iteraciones si no hay solución
            
            // --- MODIFICACIÓN: Ocultar gráfico si no es factible ---
            if (myChart) myChart.destroy();
            if (graficoContainer) graficoContainer.style.display = 'none';
            // --- FIN DE MODIFICACIÓN ---
        }

    } catch (error) {
        // --- [Manejo de Errores de Conexión] ---
        console.error('Error en el submit:', error);
        resultadoEl.innerHTML = `<div class='alert alert-danger'>Error de conexión: ${error.message}</div>`;
        aumentadoEl.innerHTML = ''; // Borra el modelo si falló
        iteracionesEl.innerHTML = ''; // Borra iteraciones si falló

        // --- MODIFICACIÓN: Ocultar gráfico si hay error ---
        if (myChart) myChart.destroy();
        if (graficoContainer) graficoContainer.style.display = 'none';
        // --- FIN DE MODIFICACIÓN ---
    }
});

// Genera campos iniciales
document.getElementById('numVariables').value = 2;
generarCamposObjetivo();

const temaOscuro = () =>{
    document.querySelector("body").setAttribute("data-bs-theme", "dark");
    document.querySelector("#mode").setAttribute("class", "fa-solid fa-sun");
}

const temaClaro = () =>{
    document.querySelector("body").setAttribute("data-bs-theme", "light");
    document.querySelector("#mode").setAttribute("class", "fa-solid fa-moon");
}

const cambiarTema = () =>{
    document.querySelector("body").getAttribute("data-bs-theme") === "light"?
    temaOscuro() : temaClaro();
}