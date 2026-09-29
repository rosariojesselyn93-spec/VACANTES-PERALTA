import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, getDocs, collection, addDoc, doc, updateDoc, deleteDoc, orderBy, query, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Correo único de administrador
const CORREO_ADMIN_PERMITIDO = "rosariojesselyn@gmail.com"; 

// ==========================================
// CONFIGURACIÓN DE FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyA-5cjJsbQ0dtIcrKLlcC62_8oaO0MhplI",
    authDomain: "vacantes-peralta.firebaseapp.com",
    databaseURL: "https://vacantes-peralta-default-rtdb.firebaseio.com",
    projectId: "vacantes-peralta",
    storageBucket: "vacantes-peralta.firebasestorage.app",
    messagingSenderId: "451345536120",
    appId: "1:451345536120:web:33906131388814e0b4898d",
    measurementId: "G-HD6HH4HC8T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Referencias del DOM
const loginSection = document.getElementById("login-section");
const adminSection = document.getElementById("admin-section");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const btnLogout = document.getElementById("btn-logout");
const filtroEstado = document.getElementById("filtro-estado");
const btnToggleBlog = document.getElementById("btn-toggle-blog");
const vacanciesSection = document.getElementById("vacancies-section");
const blogSectionContainer = document.getElementById("blog-section-container");
const formNuevoArticulo = document.getElementById("form-nuevo-articulo");

// Variables globales
let listaVacantesAdmin = []; 
let idArticuloEnEdicion = null;

// ==========================================
// 1. GESTIÓN DE SESIÓN Y ACCESO AL PANEL
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (user.email === CORREO_ADMIN_PERMITIDO) {
            if (loginSection) loginSection.style.display = "none";
            if (adminSection) adminSection.style.display = "block";
            cargarVacantes();
            cargarArticulosAdmin();
        } else {
            alert("Acceso denegado. No tienes privilegios de administrador.");
            await signOut(auth);
            if (loginSection) loginSection.style.display = "block";
            if (adminSection) adminSection.style.display = "none";
        }
    } else {
        if (loginSection) loginSection.style.display = "block";
        if (adminSection) adminSection.style.display = "none";
    }
});

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        try {
            loginError.innerText = "";
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error en login:", error);
            loginError.innerText = "Correo o contraseña incorrectos.";
        }
    });
}

if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    });
}

if (filtroEstado) {
    filtroEstado.addEventListener("change", () => {
        cargarVacantes();
    });
}

// ==========================================
// 2. BOTÓN DE ALTERNAR VISTA (VACANTES / BLOG)
// ==========================================
if (btnToggleBlog && vacanciesSection && blogSectionContainer) {
    btnToggleBlog.addEventListener("click", () => {
        const isBlogVisible = blogSectionContainer.style.display === "block";
        if (isBlogVisible) {
            blogSectionContainer.style.display = "none";
            vacanciesSection.style.display = "block";
            btnToggleBlog.textContent = "📝 Blog";
        } else {
            blogSectionContainer.style.display = "block";
            vacanciesSection.style.display = "none";
            btnToggleBlog.textContent = "💼 Vacantes";
        }
    });
}

// ==========================================
// 3. CARGAR Y GESTIONAR VACANTES
// ==========================================
async function cargarVacantes() {
    const tbody = document.getElementById("vacancies-table-body");
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Cargando vacantes...</td></tr>`;
    
    try {
        const querySnapshot = await getDocs(collection(db, "vacantes"));
        tbody.innerHTML = "";
        
        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No hay vacantes registradas.</td></tr>`;
            return;
        }

        const estadoFiltro = filtroEstado ? filtroEstado.value : "todos";
        let contadorVisibles = 0;
        listaVacantesAdmin = []; 

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Solución aplicada: Normalizar el estado a minúsculas y sin espacios
            const estadoVacante = data.estado ? data.estado.toLowerCase().trim() : 'pendiente';

            if (estadoFiltro !== "todos" && estadoVacante !== estadoFiltro) {
                return; 
            }

            contadorVisibles++;
            
            listaVacantesAdmin.push({
                id: docSnap.id,
                ...data
            });

            const tr = document.createElement("tr");

            let accionesHTML = '';
            let btnVerHTML = `<button class="btn-ver-detalle" data-id="${docSnap.id}" style="background: #17a2b8; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Ver</button>`;
            let btnEditarHTML = `<button class="btn-editar-vacante" data-id="${docSnap.id}" style="background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Editar</button>`;

            if (estadoVacante === 'pendiente') {
                accionesHTML = `
                    ${btnVerHTML}
                    ${btnEditarHTML}
                    <button class="btn btn-approve" onclick="window.cambiarEstadoVacante('${docSnap.id}', 'publicada')">Aprobar</button>
                    <button class="btn btn-reject" onclick="window.cambiarEstadoVacante('${docSnap.id}', 'rechazada')">Rechazar</button>
                `;
            } else if (estadoVacante === 'publicada' || estadoVacante === 'rechazada') {
                accionesHTML = `
                    ${btnVerHTML}
                    ${btnEditarHTML}
                    <button class="btn btn-reject" onclick="window.eliminarVacante('${docSnap.id}')">Eliminar</button>
                `;
            } else {
                accionesHTML = `${btnVerHTML} ${btnEditarHTML} <span style="color: #6b7280; font-style: italic;">Sin acciones</span>`;
            }

            let rawFecha = data.fecha || data.createdAt || data.timestamp || data.date;
            let fechaFormateada = 'Sin fecha';

            if (rawFecha) {
                if (typeof rawFecha.toDate === 'function') {
                    fechaFormateada = rawFecha.toDate().toLocaleDateString();
                } else {
                    const parsedDate = new Date(rawFecha);
                    if (!isNaN(parsedDate.getTime())) {
                        fechaFormateada = parsedDate.toLocaleDateString();
                    }
                }
            }

            tr.innerHTML = `
                <td>${data.empresa || 'N/A'}</td>
                <td>${data.puesto || data.titulo || 'N/A'}</td>
                <td>${data.ubicacion || 'N/A'}</td>
                <td>${fechaFormateada}</td>
                <td><span class="badge ${estadoVacante}">${estadoVacante}</span></td>
                <td>${accionesHTML}</td>
            `;
            tbody.appendChild(tr);
        });

        if (contadorVisibles === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No hay vacantes con el estado seleccionado.</td></tr>`;
        }
    } catch (error) {
        console.error("Error cargando vacantes:", error);
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Error al cargar vacantes.</td></tr>`;
    }
}

// ==========================================
// LÓGICA DE MODALES (DETALLES Y EDICIÓN DE VACANTES)
// ==========================================
document.addEventListener("click", async (e) => {
    // 1. Ver detalles de vacante
    if (e.target.classList.contains("btn-ver-detalle")) {
        const idVacante = e.target.getAttribute("data-id");
        const vacanteEncontrada = listaVacantesAdmin.find(v => v.id === idVacante);

        if (vacanteEncontrada) {
            document.getElementById("modal-puesto").textContent = vacanteEncontrada.puesto || vacanteEncontrada.titulo || "Sin título";
            document.getElementById("modal-empresa").textContent = vacanteEncontrada.empresa || vacanteEncontrada.empresaNombre || "Desconocida";
            document.getElementById("modal-ubicacion").textContent = vacanteEncontrada.ubicacion || "No especificada";
            document.getElementById("modal-salario").textContent = vacanteEncontrada.salario || vacanteEncontrada.sueldo || "No especificado";
            document.getElementById("modal-horario").textContent = vacanteEncontrada.horario || "No especificado";
            document.getElementById("modal-descripcion").innerHTML = vacanteEncontrada.descripcion || "Sin descripción proporcionada.";
            document.getElementById("modal-requisitos").innerHTML = vacanteEncontrada.requisitos || vacanteEncontrada.requisito || "Sin requisitos especificados.";
            document.getElementById("modal-beneficios").innerHTML = vacanteEncontrada.beneficios || vacanteEncontrada.beneficio || "Sin beneficios especificados.";

            const modal = document.getElementById("modal-detalle-vacante");
            if (modal) modal.style.display = "flex";
        }
    }

    // 2. Abrir modal para editar vacante
    if (e.target.classList.contains("btn-editar-vacante")) {
        const idVacante = e.target.getAttribute("data-id");
        const vacanteEncontrada = listaVacantesAdmin.find(v => v.id === idVacante);

        if (vacanteEncontrada) {
            document.getElementById("edit-vacante-id").value = idVacante;
            document.getElementById("edit-vacante-puesto").value = vacanteEncontrada.puesto || vacanteEncontrada.titulo || "";
            document.getElementById("edit-vacante-empresa").value = vacanteEncontrada.empresa || "";
            document.getElementById("edit-vacante-ubicacion").value = vacanteEncontrada.ubicacion || "";
            document.getElementById("edit-vacante-descripcion").value = vacanteEncontrada.descripcion || "";

            const modalEdit = document.getElementById("modal-editar-vacante");
            if (modalEdit) modalEdit.style.display = "flex";
        }
    }
});

// Cerrar modales de vacantes
const btnCerrarModal = document.getElementById("cerrar-modal");
if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", () => {
        document.getElementById("modal-detalle-vacante").style.display = "none";
    });
}

const btnCerrarModalEditarVacante = document.getElementById("cerrar-modal-editar-vacante");
if (btnCerrarModalEditarVacante) {
    btnCerrarModalEditarVacante.addEventListener("click", () => {
        document.getElementById("modal-editar-vacante").style.display = "none";
    });
}

// Guardar cambios de la vacante editada
const btnGuardarEdicionVacante = document.getElementById("guardar-edicion-vacante");
if (btnGuardarEdicionVacante) {
    btnGuardarEdicionVacante.addEventListener("click", async () => {
        const id = document.getElementById("edit-vacante-id").value;
        const puesto = document.getElementById("edit-vacante-puesto").value.trim();
        const empresa = document.getElementById("edit-vacante-empresa").value.trim();
        const ubicacion = document.getElementById("edit-vacante-ubicacion").value.trim();
        const descripcion = document.getElementById("edit-vacante-descripcion").value.trim();

        if (!puesto || !empresa) {
            alert("El puesto y la empresa son obligatorios.");
            return;
        }

        try {
            const vacanteRef = doc(db, "vacantes", id);
            await updateDoc(vacanteRef, {
                puesto,
                empresa,
                ubicacion,
                descripcion
            });

            alert("¡Vacante actualizada con éxito!");
            document.getElementById("modal-editar-vacante").style.display = "none";
            cargarVacantes();
        } catch (error) {
            console.error("Error al actualizar la vacante:", error);
            alert("Hubo un error al guardar los cambios de la vacante.");
        }
    });
}

// ==========================================
// 4. GESTIÓN DE ARTÍCULOS DEL BLOG EN ADMIN
// ==========================================
async function cargarArticulosAdmin() {
    const listaAdmin = document.getElementById("lista-articulos-admin");
    if (!listaAdmin) return;

    try {
        const q = query(collection(db, "articulos"), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);
        listaAdmin.innerHTML = "";

        if (querySnapshot.empty) {
            listaAdmin.innerHTML = `<tr><td colspan="3" class="empty-state">No hay artículos publicados.</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const fechaFormateada = data.fecha ? new Date(data.fecha).toLocaleDateString() : 'Sin fecha';
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${data.titulo || 'Sin título'}</td>
                <td>${fechaFormateada}</td>
                <td style="text-align: center;">
                    <button class="btn" style="background: #4f46e5; color: white; margin-right: 5px;" onclick="window.cargarArticuloParaEditar('${docSnap.id}')">Editar</button>
                    <button class="btn btn-reject" onclick="window.eliminarArticulo('${docSnap.id}')">Eliminar</button>
                </td>
            `;
            listaAdmin.appendChild(tr);
        });
    } catch (error) {
        console.error("Error cargando artículos en admin:", error);
        listaAdmin.innerHTML = `<tr><td colspan="3" class="empty-state">Error al cargar los artículos.</td></tr>`;
    }
}

// Inicializar el editor de texto enriquecido Quill
const quill = new Quill('#editor-container', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'], 
            [{ 'color': [] }, { 'background': [] }],    
            [{ 'font': [] }],                         
            [{ 'size': ['small', false, 'large', 'huge'] }], 
            [{ 'list': 'ordered'}, { 'list': 'bullet' }], 
            ['clean']                                 
        ]
    }
});

// Cargar artículo para editar
window.cargarArticuloParaEditar = async function(id) {
    try {
        const docRef = doc(db, "articulos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            document.getElementById("admin-blog-titulo").value = data.titulo || "";
            document.getElementById("admin-blog-resumen").value = data.resumen || "";
            document.getElementById("admin-blog-categoria").value = data.categoria || "";
            
            if (quill) {
                quill.root.innerHTML = data.contenido || "";
            }

            idArticuloEnEdicion = id;

            const btnPublicar = formNuevoArticulo.querySelector("button[type='submit']");
            if (btnPublicar) btnPublicar.textContent = "Actualizar Artículo";

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert("El artículo no existe.");
        }
    } catch (error) {
        console.error("Error al cargar el artículo para editar:", error);
        alert("Hubo un error al recuperar los datos del artículo.");
    }
};

if (formNuevoArticulo) {
    formNuevoArticulo.addEventListener("submit", async (e) => {
        e.preventDefault();
        const titulo = document.getElementById("admin-blog-titulo").value;
        const resumen = document.getElementById("admin-blog-resumen").value;
        const contenido = quill.root.innerHTML; 
        const categoria = document.getElementById("admin-blog-categoria").value;

        try {
            if (idArticuloEnEdicion) {
                const articuloRef = doc(db, "articulos", idArticuloEnEdicion);
                await updateDoc(articuloRef, {
                    titulo,
                    resumen,
                    contenido,
                    categoria
                });

                alert("¡Artículo actualizado con éxito!");
                idArticuloEnEdicion = null;
                
                const btnPublicar = formNuevoArticulo.querySelector("button[type='submit']");
                if (btnPublicar) btnPublicar.textContent = "Publicar Artículo";

            } else {
                await addDoc(collection(db, "articulos"), {
                    titulo,
                    resumen,
                    contenido,
                    categoria,
                    fecha: new Date().toISOString()
                });
                alert("¡Artículo publicado con éxito!");
            }

            formNuevoArticulo.reset();
            quill.setContents([]); 
            cargarArticulosAdmin();

        } catch (error) {
            console.error("Error al guardar el artículo:", error);
            alert("No se pudo guardar el artículo.");
        }
    });
}

// ==========================================
// 5. FUNCIONES GLOBALES PARA ACCIONES
// ==========================================
window.cambiarEstadoVacante = async function(id, nuevoEstado) {
    try {
        await updateDoc(doc(db, "vacantes", id), { estado: nuevoEstado });
        cargarVacantes();
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        alert("No se pudo actualizar el estado.");
    }
};

window.eliminarVacante = async function(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta vacante?")) {
        try {
            await deleteDoc(doc(db, "vacantes", id));
            cargarVacantes();
        } catch (error) {
            console.error("Error al eliminar vacante:", error);
            alert("No se pudo eliminar la vacante.");
        }
    }
};

window.eliminarArticulo = async function(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este artículo del blog?")) {
        try {
            await deleteDoc(doc(db, "articulos", id));
            cargarArticulosAdmin();
        } catch (error) {
            console.error("Error al eliminar artículo:", error);
            alert("No se pudo eliminar el artículo.");
        }
    }
};