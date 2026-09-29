import { db } from "./firebase-config.js";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    getDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const vacanteId = urlParams.get('id');

const infoVacanteHeader = document.getElementById('info-vacante-header');
const listaCandidatosEl = document.getElementById('lista-candidatos');

let candidatosGlobal = [];
let filtroActual = "todos";

async function inicializarVista() {
    if (!vacanteId) {
        infoVacanteHeader.innerHTML = "<p style='color: red;'>ID de vacante no válido.</p>";
        listaCandidatosEl.innerHTML = "";
        return;
    }

    try {
        const vacanteDoc = await getDoc(doc(db, "vacantes", vacanteId));
        if (vacanteDoc.exists()) {
            const dataVacante = vacanteDoc.data();
            infoVacanteHeader.innerHTML = `
                <h3 style="margin: 0 0 5px 0; color: #3D3028;">Puesto: ${dataVacante.puesto || "Sin puesto"}</h3>
                <p style="margin: 0; color: #666; font-size: 0.9rem;">Empresa: <strong>${dataVacante.empresa || "N/D"}</strong></p>
            `;
        } else {
            infoVacanteHeader.innerHTML = "<p style='color: red;'>La vacante ya no existe.</p>";
        }

        const q = query(collection(db, "solicitudes"), where("vacanteId", "==", vacanteId));
        const querySnapshot = await getDocs(q);

        candidatosGlobal = [];
        querySnapshot.forEach((docSnap) => {
            candidatosGlobal.push({ id: docSnap.id, ...docSnap.data() });
        });

        renderizarCandidatos();

    } catch (err) {
        console.error("Error al cargar solicitudes:", err);
        listaCandidatosEl.innerHTML = "<p style='color: red;'>Error al cargar las solicitudes.</p>";
    }
}

function renderizarCandidatos() {
    const candidatosFiltrados = candidatosGlobal.filter(sol => {
        const estadoSol = sol.estado || "Pendiente";
        if (filtroActual === "todos") return true;
        return estadoSol.toLowerCase() === filtroActual.toLowerCase();
    });

    if (candidatosFiltrados.length === 0) {
        listaCandidatosEl.innerHTML = "<p style='text-align: center; color: #666; padding: 20px;'>No hay candidatos en este filtro.</p>";
        return;
    }

    listaCandidatosEl.innerHTML = "";

    candidatosFiltrados.forEach((sol) => {
        const solId = sol.id;

        let badgeClass = "badge-pendiente";
        let estadoTexto = sol.estado || "Pendiente";
        if (estadoTexto.toLowerCase() === "aceptado") badgeClass = "badge-aceptado";
        if (estadoTexto.toLowerCase() === "rechazado") badgeClass = "badge-rechazado";

        let fechaEnvioStr = "Fecha no disponible";
        if (sol.fechaEnvio && typeof sol.fechaEnvio.toDate === 'function') {
            fechaEnvioStr = sol.fechaEnvio.toDate().toLocaleString('es-ES');
        }

        const licenciaInfo = sol.licenciaConducir?.tieneLicencia === "Sí" 
            ? `Sí (${sol.licenciaConducir.tipoLicencia || 'No especificada'})` 
            : (sol.licenciaConducir?.tieneLicencia || sol.licencia || "N/D");

        const emergencia = sol.contactoEmergencia || {};
        const academica = sol.formacionAcademica || {};
        const idiomas = sol.idiomas || {};
        const laboral = sol.situacionLaboral || {};
        const anterior = sol.empresaAnterior || {};
        const transporte = sol.transporteDisponibilidad || {};

        let htmlExtras = "";
        if (sol.respuestasPersonalizadas && Object.keys(sol.respuestasPersonalizadas).length > 0) {
            htmlExtras += `<div class="seccion-respuestas-extras"><strong>Preguntas Personalizadas:</strong><ul style="margin: 5px 0 0 0; padding-left: 15px;">`;
            for (const [pregunta, respuesta] of Object.entries(sol.respuestasPersonalizadas)) {
                htmlExtras += `<li><em>${pregunta}:</em> ${respuesta}</li>`;
            }
            htmlExtras += `</ul></div>`;
        }

        const card = document.createElement('div');
        card.className = 'card-candidato';
        card.innerHTML = `
            <div class="card-header-candidato" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 1.1rem; font-weight: bold; color: #3D3028; margin-right: 15px;">${sol.nombre || "Sin nombre"}</span>
                    <span class="badge-estado ${badgeClass}">${estadoTexto}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-imprimir" style="background: #EFECE6; border: 1px solid #D8CEC1; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem;" title="Imprimir Solicitud">🖨️ Imprimir</button>
                    <button type="button" class="btn-toggle-detalle" style="background: #EFECE6; border: 1px solid #D8CEC1; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600;">Ver Detalles</button>
                </div>
            </div>
            
            <div class="cuerpo-detalle" style="display: none; margin-top: 15px; border-top: 1px solid #EFECE6; padding-top: 15px;">
                
                <div class="subseccion-titulo" style="font-size: 0.95rem; color: #A05C3F; margin-top: 10px; margin-bottom: 8px; font-weight: bold;">1. Datos Personales</div>
                <div class="grid-datos">
                    <p><strong>Cédula:</strong> ${sol.cedula || "N/D"}</p>
                    <p><strong>Nacionalidad:</strong> ${sol.nacionalidad || "N/D"}</p>
                    <p><strong>Estado Civil:</strong> ${sol.estadoCivil || "N/D"}</p>
                    <p><strong>F. Nacimiento:</strong> ${sol.fechaNacimiento || "N/D"}</p>
                    <p><strong>Teléfono:</strong> ${sol.telefono || "N/D"}</p>
                    <p><strong>Correo:</strong> ${sol.correo || "N/D"}</p>
                    <p><strong>Dirección:</strong> ${sol.direccion || "N/D"}</p>
                    <p><strong>Se enteró por:</strong> ${sol.comoSeEntero || "N/D"}</p>
                    <p><strong>Licencia de Conducir:</strong> ${licenciaInfo}</p>
                </div>

                <div class="subseccion-titulo" style="font-size: 0.95rem; color: #A05C3F; margin-top: 15px; margin-bottom: 8px; font-weight: bold;">2. Contacto de Emergencia</div>
                <div class="grid-datos">
                    <p><strong>Nombre:</strong> ${emergencia.nombre || "N/D"}</p>
                    <p><strong>Parentesco:</strong> ${emergencia.parentesco || "N/D"}</p>
                    <p><strong>Teléfono:</strong> ${emergencia.telefono || "N/D"}</p>
                </div>

                <div class="subseccion-titulo" style="font-size: 0.95rem; color: #A05C3F; margin-top: 15px; margin-bottom: 8px; font-weight: bold;">3. Formación e Idiomas</div>
                <div class="grid-datos">
                    <p><strong>Nivel Académico:</strong> ${academica.nivel || sol.nivelAcademico || "N/D"}</p>
                    <p><strong>Estado Académico:</strong> ${academica.estado || "N/D"}</p>
                    <p><strong>Cursos Relevantes:</strong> ${academica.cursosRelevantes || "N/D"}</p>
                    <p><strong>Español:</strong> Hab: ${idiomas.espanol?.hablado || 'N/D'} / Esc: ${idiomas.espanol?.escrito || 'N/D'}</p>
                    <p><strong>Inglés:</strong> Hab: ${idiomas.ingles?.hablado || 'N/D'} / Esc: ${idiomas.ingles?.escrito || 'N/D'}</p>
                </div>

                <div class="subseccion-titulo" style="font-size: 0.95rem; color: #A05C3F; margin-top: 15px; margin-bottom: 8px; font-weight: bold;">5. Situación Laboral</div>
                <div class="grid-datos">
                    <p><strong>¿Trabajando actualmente?:</strong> ${laboral.trabajandoActual || sol.laborandoActual || "N/D"}</p>
                    <p><strong>Disponibilidad para comenzar:</strong> ${laboral.cuandoComenzar || "N/D"}</p>
                    <p><strong>Salario Aspirado:</strong> ${laboral.salarioAspira || sol.expectativaSalarial || "N/D"}</p>
                </div>

                <div class="subseccion-titulo" style="font-size: 0.95rem; color: #A05C3F; margin-top: 15px; margin-bottom: 8px; font-weight: bold;">Empresa Anterior</div>
                <div class="grid-datos">
                    <p><strong>Empresa:</strong> ${anterior.nombre || "N/D"}</p>
                    <p><strong>Teléfono:</strong> ${anterior.telefono || "N/D"}</p>
                    <p><strong>Fecha de Empleo:</strong> ${anterior.fechaEmpleo || "N/D"}</p>
                    <p><strong>Jefe Inmediato:</strong> ${anterior.jefeInmediato || "N/D"}</p>
                    <p><strong>Índole del Negocio:</strong> ${anterior.indoleNegocio || "N/D"}</p>
                    <p><strong>Posición:</strong> ${anterior.posicion || "N/D"}</p>
                    <p><strong>Salario Final:</strong> ${anterior.salarioFinal || "N/D"}</p>
                    <p><strong>Razón de Salida:</strong> ${anterior.razonSalida || sol.motivosSalida || "N/D"}</p>
                </div>

                <div class="subseccion-titulo" style="font-size: 0.95rem; color: #A05C3F; margin-top: 15px; margin-bottom: 8px; font-weight: bold;">7. Transporte y Disponibilidad</div>
                <div class="grid-datos">
                    <p><strong>Traslado:</strong> ${transporte.tipoTransporte || "N/D"}</p>
                    <p><strong>Facilidad de Transporte:</strong> ${transporte.facilidadTransporte || "N/D"}</p>
                    <p><strong>Feriados y Fines de Semana:</strong> ${transporte.trabajarFeriados || "N/D"}</p>
                    <p><strong>Horario Rotativo:</strong> ${transporte.horarioRotativo || "N/D"}</p>
                    <p><strong>Familiar en Compañía:</strong> ${transporte.tieneFamiliar || sol.familiaresEmpresa || "N/D"} ${transporte.familiarCompania ? '(' + transporte.familiarCompania + ')' : ''}</p>
                </div>

                ${htmlExtras}
                <div style="font-size: 0.8rem; color: #888; margin-top: 10px;">Postulado el: ${fechaEnvioStr}</div>
                <div class="acciones-candidato" style="margin-top: 15px; display: flex; gap: 10px;">
                    <button type="button" class="btn-accion btn-aceptar" data-id="${solId}" data-estado="Aceptado">Aceptar Candidato</button>
                    <button type="button" class="btn-accion btn-rechazar" data-id="${solId}" data-estado="Rechazado">Rechazar</button>
                </div>
            </div>
        `;

        // Lógica para desplegar / ocultar detalles
        const btnToggle = card.querySelector('.btn-toggle-detalle');
        const cuerpoDetalle = card.querySelector('.cuerpo-detalle');
        btnToggle.addEventListener('click', () => {
            const isOpen = cuerpoDetalle.style.display === 'block';
            cuerpoDetalle.style.display = isOpen ? 'none' : 'block';
            btnToggle.textContent = isOpen ? 'Ver Detalles' : 'Ocultar Detalles';
        });

        // Lógica para imprimir solicitud de forma individual usando un iframe oculto
        const btnImprimir = card.querySelector('.btn-imprimir');
        btnImprimir.addEventListener('click', () => {
            const nombreCandidato = sol.nombre || 'Candidato';
            
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const docIframe = iframe.contentWindow.document;
            docIframe.open();
            docIframe.write(`
                <html>
                    <head>
                        <title>Solicitud de Empleo - ${nombreCandidato}</title>
                        <style>
                            @page {
                                margin: 10mm;
                            }
                            body { 
                                font-family: Arial, sans-serif; 
                                color: #333; 
                                padding: 10px; 
                                line-height: 1.4; 
                                margin: 0;
                            }
                            h2 { color: #A05C3F; border-bottom: 2px solid #A05C3F; padding-bottom: 5px; margin-top: 0; }
                            h3 { color: #3D3028; margin-top: 15px; border-bottom: 1px solid #ddd; padding-bottom: 3px; font-size: 1rem; }
                            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-size: 0.9rem; }
                            p { margin: 3px 0; }
                        </style>
                    </head>
                    <body>
                        <h2>Solicitud de Empleo</h2>
                        <p><strong>Candidato:</strong> ${nombreCandidato}</p>
                        <p><strong>Fecha de postulación:</strong> ${fechaEnvioStr}</p>
                        
                        <h3>1. Datos Personales</h3>
                        <div class="grid">
                            <p><strong>Cédula:</strong> ${sol.cedula || "N/D"}</p>
                            <p><strong>Nacionalidad:</strong> ${sol.nacionalidad || "N/D"}</p>
                            <p><strong>Estado Civil:</strong> ${sol.estadoCivil || "N/D"}</p>
                            <p><strong>F. Nacimiento:</strong> ${sol.fechaNacimiento || "N/D"}</p>
                            <p><strong>Teléfono:</strong> ${sol.telefono || "N/D"}</p>
                            <p><strong>Correo:</strong> ${sol.correo || "N/D"}</p>
                            <p><strong>Dirección:</strong> ${sol.direccion || "N/D"}</p>
                            <p><strong>Se enteró por:</strong> ${sol.comoSeEntero || "N/D"}</p>
                            <p><strong>Licencia de Conducir:</strong> ${licenciaInfo}</p>
                        </div>

                        <h3>2. Contacto de Emergencia</h3>
                        <div class="grid">
                            <p><strong>Nombre:</strong> ${emergencia.nombre || "N/D"}</p>
                            <p><strong>Parentesco:</strong> ${emergencia.parentesco || "N/D"}</p>
                            <p><strong>Teléfono:</strong> ${emergencia.telefono || "N/D"}</p>
                        </div>

                        <h3>3. Formación e Idiomas</h3>
                        <div class="grid">
                            <p><strong>Nivel Académico:</strong> ${academica.nivel || sol.nivelAcademico || "N/D"}</p>
                            <p><strong>Estado Académico:</strong> ${academica.estado || "N/D"}</p>
                            <p><strong>Cursos Relevantes:</strong> ${academica.cursosRelevantes || "N/D"}</p>
                            <p><strong>Español:</strong> Hab: ${idiomas.espanol?.hablado || 'N/D'} / Esc: ${idiomas.espanol?.escrito || 'N/D'}</p>
                            <p><strong>Inglés:</strong> Hab: ${idiomas.ingles?.hablado || 'N/D'} / Esc: ${idiomas.ingles?.escrito || 'N/D'}</p>
                        </div>

                        <h3>5. Situación Laboral</h3>
                        <div class="grid">
                            <p><strong>¿Trabajando actualmente?:</strong> ${laboral.trabajandoActual || sol.laborandoActual || "N/D"}</p>
                            <p><strong>Disponibilidad para comenzar:</strong> ${laboral.cuandoComenzar || "N/D"}</p>
                            <p><strong>Salario Aspirado:</strong> ${laboral.salarioAspira || sol.expectativaSalarial || "N/D"}</p>
                        </div>

                        <h3>Empresa Anterior</h3>
                        <div class="grid">
                            <p><strong>Empresa:</strong> ${anterior.nombre || "N/D"}</p>
                            <p><strong>Teléfono:</strong> ${anterior.telefono || "N/D"}</p>
                            <p><strong>Fecha de Empleo:</strong> ${anterior.fechaEmpleo || "N/D"}</p>
                            <p><strong>Jefe Inmediato:</strong> ${anterior.jefeInmediato || "N/D"}</p>
                            <p><strong>Índole del Negocio:</strong> ${anterior.indoleNegocio || "N/D"}</p>
                            <p><strong>Posición:</strong> ${anterior.posicion || "N/D"}</p>
                            <p><strong>Salario Final:</strong> ${anterior.salarioFinal || "N/D"}</p>
                            <p><strong>Razón de Salida:</strong> ${anterior.razonSalida || sol.motivosSalida || "N/D"}</p>
                        </div>

                        <h3>7. Transporte y Disponibilidad</h3>
                        <div class="grid">
                            <p><strong>Traslado:</strong> ${transporte.tipoTransporte || "N/D"}</p>
                            <p><strong>Facilidad de Transporte:</strong> ${transporte.facilidadTransporte || "N/D"}</p>
                            <p><strong>Feriados y Fines de Semana:</strong> ${transporte.trabajarFeriados || "N/D"}</p>
                            <p><strong>Horario Rotativo:</strong> ${transporte.horarioRotativo || "N/D"}</p>
                            <p><strong>Familiar en Compañía:</strong> ${transporte.tieneFamiliar || sol.familiaresEmpresa || "N/D"} ${transporte.familiarCompania ? '(' + transporte.familiarCompania + ')' : ''}</p>
                        </div>
                    </body>
                </html>
            `);
            docIframe.close();

            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                document.body.removeChild(iframe);
            }, 500);
        });

        // Eventos para cambiar estado
        card.querySelectorAll('.btn-accion').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const nuevoEstado = e.target.getAttribute('data-estado');
                try {
                    await updateDoc(doc(db, "solicitudes", solId), { estado: nuevoEstado });
                    alert(`Candidato marcado como: ${nuevoEstado}`);
                    
                    const index = candidatosGlobal.findIndex(c => c.id === solId);
                    if (index !== -1) candidatosGlobal[index].estado = nuevoEstado;
                    renderizarCandidatos();
                } catch (err) {
                    console.error("Error al actualizar estado:", err);
                    alert("No se pudo actualizar el estado.");
                }
            });
        });

        listaCandidatosEl.appendChild(card);
    });
}

// Configurar eventos de los botones de filtro
document.addEventListener("DOMContentLoaded", () => {
    inicializarVista();

    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-filtro').forEach(b => {
                b.style.background = "#EFECE6";
                b.style.color = "#3D3028";
            });
            e.target.style.background = "#A05C3F";
            e.target.style.color = "#fff";

            filtroActual = e.target.getAttribute('data-filtro');
            renderizarCandidatos();
        });
    });
});