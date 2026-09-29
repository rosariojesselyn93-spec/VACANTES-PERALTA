import { db } from "./firebase-config.js";
import { doc, getDoc, addDoc, collection, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const vacanteId = urlParams.get('id');

const infoVacanteDiv = document.getElementById('detalle-vacante-info');
const contenedorExtras = document.getElementById('contenedor-preguntas-extras');
let preguntasPersonalizadasGlobal = [];

// Función para actualizar automáticamente los registros y formularios antiguos en Firebase
async function migrarDocumentosAntiguos() {
    try {
        const querySnapshot = await getDocs(collection(db, "solicitudes"));
        const batch = writeBatch(db);
        let actualizados = false;

        querySnapshot.forEach((documento) => {
            const data = documento.data();
            if (data.nacionalidad === undefined || data.idiomas === undefined || data.respuestasPersonalizadas === undefined) {
                const docRef = doc(db, "solicitudes", documento.id);
                batch.update(docRef, {
                    nacionalidad: data.nacionalidad || "",
                    estadoCivil: data.estadoCivil || "",
                    licenciaConducir: data.licenciaConducir || { tieneLicencia: "No", tipoLicencia: "" },
                    idiomas: data.idiomas || {
                        espanol: { hablado: "N/A", escrito: "N/A" },
                        ingles: { hablado: "N/A", escrito: "N/A" }
                    },
                    empresaAnterior: data.empresaAnterior || {
                        nombre: "",
                        telefono: "",
                        fechaEmpleo: "",
                        jefeInmediato: "",
                        indoleNegocio: "",
                        posicion: "",
                        salarioFinal: "",
                        razonSalida: ""
                    },
                    transporteDisponibilidad: data.transporteDisponibilidad || {
                        tipoTransporte: "",
                        facilidadTransporte: "",
                        trabajarFeriados: "",
                        horarioRotativo: "",
                        tieneFamiliar: "No",
                        familiarCompania: ""
                    },
                    respuestasPersonalizadas: data.respuestasPersonalizadas || {}
                });
                actualizados = true;
            }
        });

        if (actualizados) {
            await batch.commit();
            console.log("Se han sincronizado los registros antiguos correctamente.");
        }
    } catch (error) {
        console.error("Error en la migración automática:", error);
    }
}

async function cargarDatosVacante() {
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').forEach(el => {
        el.placeholder = '';
    });

    if (!vacanteId) {
        infoVacanteDiv.innerHTML = "<p style='color: red;'>Error: No se ha especificado una vacante válida.</p>";
        document.getElementById('form-solicitud-candidato').style.display = 'none';
        return;
    }

    try {
        const docRef = doc(db, "vacantes", vacanteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            infoVacanteDiv.innerHTML = `
                <h3 style="margin: 0 0 5px 0; color: #3D3028;">${data.puesto || "Vacante"}</h3>
                <p style="margin: 0; color: #7A6E65; font-size: 0.9rem;">Empresa: <strong>${data.empresa || "Confidencial"}</strong></p>
            `;

            if (data.tipoFormulario === "personalizado" && data.preguntasPersonalizadas && data.preguntasPersonalizadas.length > 0) {
                preguntasPersonalizadasGlobal = data.preguntasPersonalizadas;
                let htmlExtras = "<h3 class='seccion-titulo'>Preguntas Adicionales de la Empresa</h3>";
                
                data.preguntasPersonalizadas.forEach((p, index) => {
                    htmlExtras += `<div class="seccion-personalizada-bloque">`;
                    htmlExtras += `<label>${p.texto}</label>`;
                    if (p.tipo === "textarea") {
                        htmlExtras += `<textarea class="respuesta-extra" data-index="${index}" placeholder=""></textarea>`;
                    } else if (p.tipo === "select") {
                        htmlExtras += `
                            <select class="respuesta-extra" data-index="${index}">
                                <option value="">Selecciona una opción</option>
                                <option value="Sí">Sí</option>
                                <option value="No">No</option>
                            </select>`;
                    } else {
                        htmlExtras += `<input type="text" class="respuesta-extra" data-index="${index}" placeholder="">`;
                    }
                    htmlExtras += `</div>`;
                });
                contenedorExtras.innerHTML = htmlExtras;
            }

        } else {
            infoVacanteDiv.innerHTML = "<p style='color: red;'>La vacante solicitada no existe o ha sido eliminada.</p>";
            document.getElementById('form-solicitud-candidato').style.display = 'none';
        }
    } catch (err) {
        console.error("Error al cargar vacante:", err);
        infoVacanteDiv.innerHTML = "<p style='color: red;'>Error al cargar los detalles de la vacante.</p>";
    }
}

// Control de campos condicionales y ejecución
document.addEventListener("DOMContentLoaded", async () => {
    await migrarDocumentosAntiguos();
    cargarDatosVacante();

    // 1. Condicional para Licencia de Conducir
    const selectLicencia = document.getElementById('licencia');
    const bloqueLicencia = document.getElementById('bloque-tipo-licencia');
    const inputTipoLicencia = document.getElementById('tipoLicencia');

    selectLicencia.addEventListener('change', (e) => {
        if (e.target.value === "Sí") {
            bloqueLicencia.style.display = "block";
        } else {
            bloqueLicencia.style.display = "none";
            inputTipoLicencia.value = "";
        }
    });

    // 2. Condicional para Horario Académico (En curso)
    const selectEstadoAcademico = document.getElementById('estadoAcademico');
    const bloqueHorario = document.getElementById('bloque-horario-academico');
    const inputHorario = document.getElementById('horarioAcademico');

    selectEstadoAcademico.addEventListener('change', (e) => {
        if (e.target.value === "En curso") {
            bloqueHorario.style.display = "block";
        } else {
            bloqueHorario.style.display = "none";
            inputHorario.value = "";
        }
    });

    // 3. Condicional para Situación Laboral y Motivo de Búsqueda
    const selectTrabajando = document.getElementById('trabajandoActual');
    const bloqueLaboral = document.getElementById('bloque-info-laboral');
    const empresaActual = document.getElementById('empresaActual');
    const puestoActual = document.getElementById('puestoActual');
    const tiempoPuesto = document.getElementById('tiempoPuesto');
    const motivoBusqueda = document.getElementById('motivoBusqueda');

    selectTrabajando.addEventListener('change', (e) => {
        if (e.target.value === "Sí") {
            bloqueLaboral.style.display = "block";
        } else {
            bloqueLaboral.style.display = "none";
            empresaActual.value = "";
            puestoActual.value = "";
            tiempoPuesto.value = "";
            motivoBusqueda.value = "";
        }
    });

    // 4. Condicional para Familiar en la Compañía
    const selectFamiliar = document.getElementById('tieneFamiliar');
    const bloqueFamiliar = document.getElementById('bloque-familiar-info');
    const inputFamiliarCompania = document.getElementById('familiarCompania');

    selectFamiliar.addEventListener('change', (e) => {
        if (e.target.value === "Sí") {
            bloqueFamiliar.style.display = "block";
        } else {
            bloqueFamiliar.style.display = "none";
            inputFamiliarCompania.value = "";
        }
    });
});

// Enviar formulario completo de solicitud
const formSolicitud = document.getElementById('form-solicitud-candidato');
if (formSolicitud) {
    formSolicitud.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnEnviar = document.getElementById('btn-enviar-solicitud');

        try {
            btnEnviar.disabled = true;
            btnEnviar.textContent = "Enviando solicitud...";

            let respuestasExtras = {};
            const inputsExtras = document.querySelectorAll('.respuesta-extra');
            inputsExtras.forEach((input) => {
                const index = input.getAttribute('data-index');
                const preguntaTexto = preguntasPersonalizadasGlobal[index]?.texto || `Pregunta ${index}`;
                respuestasExtras[preguntaTexto] = input.value.trim();
            });

            const nuevaSolicitud = {
                vacanteId: vacanteId || "",
                nombre: document.getElementById('nombre').value.trim(),
                cedula: document.getElementById('cedula').value.trim(),
                nacionalidad: document.getElementById('nacionalidad').value.trim(),
                estadoCivil: document.getElementById('estadoCivil').value,
                fechaNacimiento: document.getElementById('fechaNacimiento').value,
                telefono: document.getElementById('telefono').value.trim(),
                correo: document.getElementById('correo').value.trim(),
                direccion: document.getElementById('direccion').value.trim(),
                comoSeEntero: document.getElementById('comoSeEntero').value,
                
                licenciaConducir: {
                    tieneLicencia: document.getElementById('licencia').value,
                    tipoLicencia: document.getElementById('tipoLicencia').value.trim()
                },

                contactoEmergencia: {
                    nombre: document.getElementById('nombreEmergencia').value.trim(),
                    parentesco: document.getElementById('parentescoEmergencia').value.trim(),
                    telefono: document.getElementById('telefonoEmergencia').value.trim()
                },

                formacionAcademica: {
                    nivel: document.getElementById('nivelAcademico').value,
                    estado: document.getElementById('estadoAcademico').value,
                    horario: document.getElementById('horarioAcademico').value.trim(),
                    cursosRelevantes: document.getElementById('cursosRelevantes').value.trim()
                },

                idiomas: {
                    espanol: { hablado: document.getElementById('espaniolHablado').value, escrito: document.getElementById('espaniolEscrito').value },
                    ingles: { hablado: document.getElementById('inglesHablado').value, escrito: document.getElementById('inglesEscrito').value }
                },

                situacionLaboral: {
                    trabajandoActual: document.getElementById('trabajandoActual').value,
                    empresaActual: document.getElementById('empresaActual').value.trim(),
                    puestoActual: document.getElementById('puestoActual').value.trim(),
                    tiempoPuesto: document.getElementById('tiempoPuesto').value.trim(),
                    motivoBusqueda: document.getElementById('motivoBusqueda').value.trim(),
                    cuandoComenzar: document.getElementById('cuandoComenzar').value.trim(),
                    salarioAspira: document.getElementById('salarioAspira').value.trim()
                },

                empresaAnterior: {
                    nombre: document.getElementById('antEmpresa').value.trim(),
                    telefono: document.getElementById('antTelefono').value.trim(),
                    fechaEmpleo: document.getElementById('antFecha').value.trim(),
                    jefeInmediato: document.getElementById('antJefe').value.trim(),
                    indoleNegocio: document.getElementById('antIndole').value.trim(),
                    posicion: document.getElementById('antPosicion').value.trim(),
                    salarioFinal: document.getElementById('antSalario').value.trim(),
                    razonSalida: document.getElementById('antRazon').value.trim()
                },

                transporteDisponibilidad: {
                    tipoTransporte: document.getElementById('tipoTransporte').value,
                    facilidadTransporte: document.getElementById('facilidadTransporte').value,
                    trabajarFeriados: document.getElementById('trabajarFeriados').value,
                    horarioRotativo: document.getElementById('horarioRotativo').value,
                    tieneFamiliar: document.getElementById('tieneFamiliar').value,
                    familiarCompania: document.getElementById('familiarCompania').value.trim()
                },

                respuestasPersonalizadas: respuestasExtras,
                estado: "Pendiente",
                fechaEnvio: new Date()
            };

            await addDoc(collection(db, "solicitudes"), nuevaSolicitud);
            
            alert("¡Tu solicitud ha sido enviada con éxito! La empresa evaluará tus respuestas.");
            formSolicitud.reset();
            window.location.href = "index.html"; 

        } catch (err) {
            console.error("Error detallado al enviar solicitud:", err);
            alert("Error técnico: " + (err.code || "desconocido") + " - " + (err.message || err));
            btnEnviar.disabled = false;
            btnEnviar.textContent = "Enviar Solicitud";
        }
    });
}