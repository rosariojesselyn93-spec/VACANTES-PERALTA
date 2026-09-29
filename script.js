import { db } from "./firebase-config.js";
import {
    collection,
    query,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("🚀 script.js iniciado correctamente.");

(function iniciarModuloVacantes() {
    const contenedor = document.getElementById("vacantes-container");
    const contenedorPaginacion = document.getElementById("paginacion-container");
    
    if (!contenedor) return;

    const inputBuscador = document.getElementById("buscador");
    const btnBuscar = document.getElementById("btnBuscar");

    let vacantesCargadas = [];
    let paginaActual = 1;
    const vacantesPorPagina = 15; // 15 vacantes por página

    // --- FUNCIONES AUXILIARES ---
    function normalizarTexto(texto) {
        if (!texto) return "";
        return texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function normalizarFecha(fecha) {
        if (!fecha) return new Date();
        try {
            if (typeof fecha.toDate === 'function') return fecha.toDate();
            if (typeof fecha.seconds === 'number') return new Date(fecha.seconds * 1000);
            return new Date(fecha);
        } catch (e) { return new Date(); }
    }

    function obtenerTiempoTranscurrido(fechaOriginal) {
        const fechaVacante = normalizarFecha(fechaOriginal);
        const hoy = new Date();

        // Normalizamos ambas fechas a medianoche (00:00:00) para comparar días naturales exactos
        const vacanteSinHora = new Date(fechaVacante.getFullYear(), fechaVacante.getMonth(), fechaVacante.getDate());
        const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

        const diffTiempo = hoySinHora - vacanteSinHora;
        const diffDias = Math.round(diffTiempo / (1000 * 60 * 60 * 24));

        if (diffDias <= 0) return 'Hoy';
        if (diffDias === 1) return 'Ayer';
        if (diffDias < 7) return `Hace ${diffDias} días`;
        
        const sem = Math.floor(diffDias / 7);
        return sem === 1 ? 'Hace 1 semana' : `Hace ${sem} semanas`;
    }

    // --- CARGA Y RENDERIZADO ---
    async function cargarVacantes(esCargaInicial = false) {
        if (esCargaInicial) contenedor.innerHTML = "<p>Cargando vacantes...</p>";

        try {
            const snapshot = await getDocs(query(collection(db, "vacantes")));
            const nuevasVacantes = [];

            snapshot.forEach((doc) => {
                const vacante = doc.data();
                const estado = (vacante.estado || "publicada").toLowerCase().trim();
                if (["publicada", "activa"].includes(estado)) {
                    nuevasVacantes.push({
                        id: doc.id,
                        titulo: vacante.puesto || vacante.titulo || "Sin título",
                        empresa: vacante.empresa || vacante.empresaNombre || "Confidencial",
                        ubicacion: vacante.ubicacion || "Santo Domingo",
                        salario: vacante.salario || vacante.sueldo || "",
                        descripcion: vacante.descripcion || "",
                        fecha: normalizarFecha(vacante.fechaCreacion || vacante.fecha)
                    });
                }
            });

            nuevasVacantes.sort((a, b) => b.fecha - a.fecha);
            vacantesCargadas = nuevasVacantes;
            filtrarVacantes();
        } catch (error) {
            console.error("Error al cargar de Firebase:", error);
            contenedor.innerHTML = `<p>Error al cargar las vacantes.</p>`;
        }
    }

    function renderizarVacantes(lista) {
        if (lista.length === 0) {
            contenedor.innerHTML = "<p>No hay vacantes que coincidan con tu búsqueda.</p>";
            return;
        }

        contenedor.innerHTML = lista.map(vacante => `
            <article class="vacante">
                <span class="fecha-publicacion">Publicado: ${obtenerTiempoTranscurrido(vacante.fecha)}</span>
                <h3 style="margin: 5px 0;">${vacante.titulo}</h3>
                <p><strong>Empresa:</strong> ${vacante.empresa}</p>
                <p><strong>Ubicación:</strong> ${vacante.ubicacion}</p>
                <div class="vacante-acciones" style="margin-top: 10px;">
                    <a class="btn-detalles" href="detalle.html?id=${vacante.id}">Ver detalles</a>
                </div>
            </article>
        `).join('');
    }

    // --- LÓGICA DE PAGINACIÓN ---
    function renderizarConPaginacion(listaCompleta) {
        const inicio = (paginaActual - 1) * vacantesPorPagina;
        const listaPagina = listaCompleta.slice(inicio, inicio + vacantesPorPagina);
        
        renderizarVacantes(listaPagina);
        
        const totalPaginas = Math.ceil(listaCompleta.length / vacantesPorPagina);
        if (!contenedorPaginacion) return;

        if (totalPaginas <= 1) {
            contenedorPaginacion.innerHTML = "";
            return;
        }

        contenedorPaginacion.innerHTML = Array.from({length: totalPaginas}, (_, i) => i + 1)
            .map(num => `
                <button class="btn-paginacion ${num === paginaActual ? 'activo' : ''}" 
                    onclick="window.cambiarPagina(${num})">${num}</button>
            `).join('');
    }

    window.cambiarPagina = (num) => {
        paginaActual = num;
        filtrarVacantes(false); 
        window.scrollTo(0, document.querySelector('.seccion-vacantes').offsetTop - 100);
    };

    function filtrarVacantes(resetPagina = true) {
        if (resetPagina) paginaActual = 1; 

        const texto = normalizarTexto(inputBuscador?.value || "");

        const resultados = vacantesCargadas.filter(v => {
            const tituloMatch = normalizarTexto(v.titulo).includes(texto);
            const empresaMatch = normalizarTexto(v.empresa).includes(texto);
            const ubicacionMatch = normalizarTexto(v.ubicacion).includes(texto);
            
            return tituloMatch || empresaMatch || ubicacionMatch;
        });

        renderizarConPaginacion(resultados);
    }

    // --- EVENTOS ---
    if (btnBuscar) btnBuscar.addEventListener("click", () => filtrarVacantes(true));
    if (inputBuscador) {
        inputBuscador.addEventListener("keyup", () => filtrarVacantes(true));
    }

    // Inicio de la carga
    const ocultarLoader = () => {
        const loader = document.getElementById("global-loader");
        if (loader) {
            loader.classList.add("hidden");
            loader.style.display = "none";
        }
    };
    
    cargarVacantes(true);
    window.addEventListener("load", ocultarLoader);
    setTimeout(ocultarLoader, 2000);
})();