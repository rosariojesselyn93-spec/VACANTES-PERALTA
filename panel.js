import { db } from "./firebase-config.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    doc,
    updateDoc,
    deleteDoc,
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const auth = getAuth();
console.log("⚡ panel.js reiniciado desde cero.");

// Funciones globales de formato de texto
window.formatText = function(command, targetId) {
    const editor = document.getElementById(targetId);
    if (editor) {
        editor.focus();
        document.execCommand(command, false, null);
    }
};

window.changeFontName = function(fontName, targetId) {
    const editor = document.getElementById(targetId);
    if (editor) {
        editor.focus();
        document.execCommand('fontName', false, fontName);
    }
};

window.changeFontSize = function(size, targetId) {
    const editor = document.getElementById(targetId);
    if (editor && size) {
        editor.focus();
        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) return;
        const range = selection.getRangeAt(0);
        const span = document.createElement("span");
        span.style.fontSize = size;
        span.appendChild(range.extractContents());
        range.insertNode(span);
    }
};

// Funciones globales para el manejo del Modal de Formulario de Solicitud
window.abrirConfiguracionFormulario = async function(idVacante, puesto) {
    const modal = document.getElementById('modal-formulario');
    if (!modal) return;

    document.getElementById('modal-titulo-vacante').textContent = `Configurar Formulario: ${puesto}`;
    document.getElementById('input-enlace-publico').value = `${window.location.origin}/aplicar.html?id=${idVacante}`;
    modal.style.display = 'flex';

    // Cargar configuración existente si la hay en Firestore
    try {
        const vacanteDoc = await getDoc(doc(db, "vacantes", idVacante));
        if (vacanteDoc.exists()) {
            const data = vacanteDoc.data();
            const tipoFormConfig = data.tipoFormulario || "prehecho";
            
            const radioPrehecho = document.querySelector('input[name="tipo_form"][value="prehecho"]');
            const radioPersonalizado = document.querySelector('input[name="tipo_form"][value="personalizado"]');
            const seccionPersonalizada = document.getElementById('seccion-personalizada');
            const listaPreguntasExtras = document.getElementById('lista-preguntas-extras');

            if (tipoFormConfig === "personalizado") {
                if (radioPersonalizado) radioPersonalizado.checked = true;
                if (seccionPersonalizada) seccionPersonalizada.style.display = 'block';
                
                if (listaPreguntasExtras) {
                    listaPreguntasExtras.innerHTML = "";
                    if (data.preguntasPersonalizadas && Array.isArray(data.preguntasPersonalizadas)) {
                        data.preguntasPersonalizadas.forEach(p => {
                            agregarFilaPregunta(p);
                        });
                    }
                }
            } else {
                if (radioPrehecho) radioPrehecho.checked = true;
                if (seccionPersonalizada) seccionPersonalizada.style.display = 'none';
                if (listaPreguntasExtras) listaPreguntasExtras.innerHTML = "";
            }

            // Guardar ID activo en el botón de guardar del modal
            const btnGuardarModal = document.getElementById('btn-guardar-config-form');
            if (btnGuardarModal) {
                btnGuardarModal.setAttribute('data-vacante-id', idVacante);
            }
        }
    } catch (err) {
        console.error("Error al cargar configuración del formulario:", err);
    }
};

window.verSolicitudes = function(idVacante) {
    // Redirige a la vista donde la empresa evaluará las respuestas de los candidatos
    window.location.href = `solicitudes.html?id=${idVacante}`;
};

// Función auxiliar para agregar campos de preguntas personalizadas dinámicamente
function agregarFilaPregunta(preguntaData = null) {
    const lista = document.getElementById('lista-preguntas-extras');
    if (!lista) return;

    const div = document.createElement('div');
    div.className = 'item-pregunta-custom';
    div.style.cssText = "display: flex; gap: 10px; align-items: center; background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #D8CEC1;";

    const textoVal = preguntaData ? (preguntaData.texto || "") : "";
    const tipoVal = preguntaData ? (preguntaData.tipo || "text") : "text";

    div.innerHTML = `
        <input type="text" class="input-texto-pregunta" placeholder="Escribe tu pregunta aquí..." value="${textoVal}" style="flex: 1; padding: 8px; border: 1px solid #D8CEC1; border-radius: 4px; font-size: 0.9rem;">
        <select class="select-tipo-pregunta" style="padding: 8px; border: 1px solid #D8CEC1; border-radius: 4px; font-size: 0.9rem; background: #F8F6F2;">
            <option value="text" ${tipoVal === 'text' ? 'selected' : ''}>Respuesta Corta</option>
            <option value="textarea" ${tipoVal === 'textarea' ? 'selected' : ''}>Respuesta Larga</option>
            <option value="select" ${tipoVal === 'select' ? 'selected' : ''}>Selección (Sí/No)</option>
        </select>
        <button type="button" class="btn-eliminar-pregunta" style="background: #DC2626; color: #fff; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">&times;</button>
    `;

    div.querySelector('.btn-eliminar-pregunta').addEventListener('click', () => {
        div.remove();
    });

    lista.appendChild(div);
}

// 1. Función para listar las vacantes de forma resumida y compacta
async function cargarMisVacantes(uidEmpresa) {
    const contenedor = document.getElementById("lista-vacantes");
    if (!contenedor) return;

    contenedor.innerHTML = "<p>Cargando tus vacantes...</p>";

    try {
        const q = query(collection(db, "vacantes"), where("uidEmpresa", "==", uidEmpresa));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            contenedor.innerHTML = "<p>Aún no has publicado ninguna vacante.</p>";
            return;
        }

        contenedor.innerHTML = "";
        querySnapshot.forEach((docSnap) => {
            const vacante = docSnap.data();
            const vacanteId = docSnap.id;

            // CORRECCIÓN DE FECHA: Forzamos formato estricto español (DD/MM/YYYY) para evitar errores de interpretación
            let fechaFormateada = "Sin fecha";
            if (vacante.fechaCreacion) {
                let fechaObj;
                if (typeof vacante.fechaCreacion.toDate === 'function') {
                    fechaObj = vacante.fechaCreacion.toDate();
                } else {
                    fechaObj = new Date(vacante.fechaCreacion);
                }

                if (!isNaN(fechaObj)) {
                    fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                }
            }

            const div = document.createElement("div");
            div.className = "vacante-item-resumido";
            
            div.innerHTML = `
                <div class="vacante-info-principal">
                    <span class="vacante-titulo-puesto">${vacante.puesto || "Sin puesto"} <span style="font-weight: normal; color: #666;">(${vacante.empresa || "Sin empresa"})</span></span>
                    <span class="vacante-fecha-pub">Publicada el: ${fechaFormateada}</span>
                </div>
                <div class="vacante-acciones-botones">
                    <button type="button" class="btn-accion-panel" style="background-color: #2563EB; color: #fff;" onclick="abrirConfiguracionFormulario('${vacanteId}', '${vacante.puesto ? vacante.puesto.replace(/'/g, "\\'") : "Vacante"}')">Formulario</button>
                    <button type="button" class="btn-accion-panel" style="background-color: #059669; color: #fff;" onclick="verSolicitudes('${vacanteId}')">Solicitudes</button>
                    <a href="detalle.html?id=${vacanteId}" class="btn-accion-panel btn-ver-completa" target="_blank" rel="noopener noreferrer">Ver</a>
                    ${vacante.estado !== "cerrada" ? `<button type="button" class="btn-accion-panel btn-cerrar-vacante" data-id="${vacanteId}">Cerrar</button>` : ''}
                    <button type="button" class="btn-accion-panel btn-eliminar-vacante" data-id="${vacanteId}">Eliminar</button>
                </div>
            `;

            // Evento para cerrar vacante
            const btnCerrar = div.querySelector(".btn-cerrar-vacante");
            if (btnCerrar) {
                btnCerrar.addEventListener("click", async () => {
                    if (confirm("¿Marcar esta vacante como cerrada?")) {
                        try {
                            await updateDoc(doc(db, "vacantes", vacanteId), { estado: "cerrada" });
                            cargarMisVacantes(uidEmpresa);
                        } catch (err) {
                            console.error("Error al cerrar vacante:", err);
                        }
                    }
                });
            }

            // Evento para eliminar vacante
            div.querySelector(".btn-eliminar-vacante").addEventListener("click", async () => {
                if (confirm("¿Eliminar permanentemente esta vacante?")) {
                    try {
                        await deleteDoc(doc(db, "vacantes", vacanteId));
                        cargarMisVacantes(uidEmpresa);
                    } catch (err) {
                        console.error("Error al eliminar vacante:", err);
                    }
                }
            });

            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error("Error al cargar vacantes:", error);
        contenedor.innerHTML = "<p>Error al cargar tus publicaciones.</p>";
    }
}

// 2. Control de Autenticación
onAuthStateChanged(auth, async (user) => {
    const bienvenidaEl = document.getElementById("nombre-usuario");

    if (user) {
        try {
            // Consultamos la colección "usuarios" para obtener la información de la empresa de forma segura
            const userDocRef = doc(db, "usuarios", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                if (bienvenidaEl) {
                    bienvenidaEl.innerText = data.nombre || user.email;
                }
            } else {
                if (bienvenidaEl) bienvenidaEl.innerText = user.email;
            }

            cargarMisVacantes(user.uid);

        } catch (error) {
            console.error("❌ Error al verificar empresa:", error);
            if (bienvenidaEl) bienvenidaEl.innerText = user.email;
        }
    } else {
        window.location.href = "login.html";
    }
});

// 3. Configuración de Eventos del DOM
document.addEventListener("DOMContentLoaded", () => {
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "login.html";
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
            }
        });
    }

    // Manejo de eventos del Modal de Formulario
    const modalFormulario = document.getElementById('modal-formulario');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');
    const btnCopiarEnlace = document.getElementById('btn-copiar-enlace');
    const btnAgregarPregunta = document.getElementById('btn-agregar-pregunta');
    const btnGuardarConfigForm = document.getElementById('btn-guardar-config-form');

    if (btnCerrarModal && modalFormulario) {
        btnCerrarModal.addEventListener('click', () => {
            modalFormulario.style.display = 'none';
        });
    }

    if (btnCancelarModal && modalFormulario) {
        btnCancelarModal.addEventListener('click', () => {
            modalFormulario.style.display = 'none';
        });
    }

    // Alternar vista de formulario prehecho vs personalizado
    document.querySelectorAll('input[name="tipo_form"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const seccionPersonalizada = document.getElementById('seccion-personalizada');
            if (seccionPersonalizada) {
                if (e.target.value === 'personalizado') {
                    seccionPersonalizada.style.display = 'block';
                } else {
                    seccionPersonalizada.style.display = 'none';
                }
            }
        });
    });

    if (btnAgregarPregunta) {
        btnAgregarPregunta.addEventListener('click', () => {
            agregarFilaPregunta();
        });
    }

    if (btnCopiarEnlace) {
        btnCopiarEnlace.addEventListener('click', () => {
            const inputEnlace = document.getElementById('input-enlace-publico');
            if (inputEnlace) {
                inputEnlace.select();
                navigator.clipboard.writeText(inputEnlace.value);
                alert('¡Enlace copiado al portapapeles!');
            }
        });
    }

    if (btnGuardarConfigForm) {
        btnGuardarConfigForm.addEventListener('click', async () => {
            const vacanteId = btnGuardarConfigForm.getAttribute('data-vacante-id');
            if (!vacanteId) {
                alert("No se ha seleccionado ninguna vacante válida.");
                return;
            }

            const tipoFormSeleccionado = document.querySelector('input[name="tipo_form"]:checked')?.value || "prehecho";
            let preguntasPersonalizadas = [];

            if (tipoFormSeleccionado === "personalizado") {
                const filas = document.querySelectorAll('.item-pregunta-custom');
                filas.forEach(fila => {
                    const texto = fila.querySelector('.input-texto-pregunta')?.value.trim() || "";
                    const tipo = fila.querySelector('.select-tipo-pregunta')?.value || "text";
                    if (texto !== "") {
                        preguntasPersonalizadas.push({ texto, tipo });
                    }
                });
            }

            try {
                const vacanteRef = doc(db, "vacantes", vacanteId);
                await updateDoc(vacanteRef, {
                    tipoFormulario: tipoFormSeleccionado,
                    preguntasPersonalizadas: preguntasPersonalizadas
                });

                alert("¡Configuración de formulario guardada con éxito!");
                if (modalFormulario) modalFormulario.style.display = 'none';
            } catch (err) {
                console.error("Error al guardar la configuración del formulario:", err);
                alert("Hubo un error al guardar la configuración.");
            }
        });
    }

    const formVacante = document.getElementById("form-vacante");
    if (formVacante) {
        formVacante.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("📨 Formulario enviado, procesando vacante...");

            const user = auth.currentUser;
            if (!user) {
                alert("Sesión expirada. Por favor, vuelve a iniciar sesión.");
                window.location.href = "login.html";
                return;
            }

            const inputEmpresa = document.getElementById("empresa");
            const inputPuesto = document.getElementById("puesto");
            const inputUbicacion = document.getElementById("ubicacion");
            const inputTipoContrato = document.getElementById("tipoContrato");
            const inputSalario = document.getElementById("salario");
            const inputHorario = document.getElementById("horario");
            const inputCorreo = document.getElementById("correo");

            const descEditor = document.getElementById("desc-editor");
            const reqEditor = document.getElementById("req-editor");
            const benEditor = document.getElementById("ben-editor");

            const nuevaVacante = {
                empresa: inputEmpresa ? inputEmpresa.value.trim() : "",
                puesto: inputPuesto ? inputPuesto.value.trim() : "",
                ubicacion: inputUbicacion ? inputUbicacion.value.trim() : "",
                tipoContrato: inputTipoContrato ? inputTipoContrato.value.trim() : "",
                salario: inputSalario ? inputSalario.value.trim() : "",
                horario: inputHorario ? inputHorario.value.trim() : "",
                descripcion: descEditor ? descEditor.innerHTML.trim() : "",
                requisitos: reqEditor ? reqEditor.innerHTML.trim() : "",
                beneficios: benEditor ? benEditor.innerHTML.trim() : "",
                correo: inputCorreo ? inputCorreo.value.trim() : "",
                uidEmpresa: user.uid,
                estado: "pendiente",
                tipoFormulario: "prehecho",
                preguntasPersonalizadas: [],
                fechaCreacion: new Date()
            };

            try {
                const docRef = await addDoc(collection(db, "vacantes"), nuevaVacante);
                console.log("🎉 Vacante guardada con ID:", docRef.id);
                alert("¡Vacante publicada y enviada a revisión con éxito!");
                
                formVacante.reset();
                if (descEditor) descEditor.innerHTML = "";
                if (reqEditor) reqEditor.innerHTML = "";
                if (benEditor) benEditor.innerHTML = "";

                cargarMisVacantes(user.uid);
            } catch (error) {
                console.error("🔥 Error al guardar la vacante en Firestore:", error);
                alert("Error al guardar: " + error.message);
            }
        });
    }
});