document.addEventListener("DOMContentLoaded", () => {
    // Inputs para actualización en tiempo real
    const inputs = document.querySelectorAll("#cv-form input, #cv-form textarea");
    inputs.forEach(input => {
        input.addEventListener("input", actualizarCV);
    });

    // Lógica segura para la foto de perfil
    const inputFoto = document.getElementById("input-foto");
    const imgOutput = document.getElementById("cv-foto-output");

    if (inputFoto) {
        inputFoto.addEventListener("change", (e) => {
            const archivo = e.target.files[0];
            if (archivo) {
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
                    alert("Por favor, selecciona una imagen en formato JPG, PNG o WebP.");
                    inputFoto.value = "";
                    if (imgOutput) {
                        imgOutput.src = "";
                        imgOutput.style.display = "none";
                    }
                    return;
                }

                const lector = new FileReader();
                lector.onload = function(evento) {
                    const imgTemp = new Image();
                    imgTemp.onload = function() {
                        if (imgOutput) {
                            imgOutput.src = evento.target.result;
                            imgOutput.style.display = "block";
                        }
                    };
                    imgTemp.onerror = function() {
                        alert("El archivo de imagen está dañado o no se puede leer.");
                        inputFoto.value = "";
                        if (imgOutput) {
                            imgOutput.src = "";
                            imgOutput.style.display = "none";
                        }
                    };
                    imgTemp.src = evento.target.result;
                };
                lector.readAsDataURL(archivo);
            } else {
                if (imgOutput) {
                    imgOutput.src = "";
                    imgOutput.style.display = "none";
                }
            }
        });
    }

    // Evento del botón de exportación a PNG usando html2canvas
    const btnExportar = document.getElementById("btn-exportar-pdf") || document.getElementById("btn-descargar-png");
    if (btnExportar) {
        btnExportar.addEventListener("click", () => {
            const elemento = document.getElementById("cv-preview");
            if (!elemento) {
                alert("No se encontró el elemento de vista previa del currículum.");
                return;
            }

            if (typeof html2canvas === 'undefined') {
                alert("La librería html2canvas no está cargada.");
                return;
            }

            html2canvas(elemento, {
                scale: 2,
                useCORS: true
            }).then(canvas => {
                const imagenURL = canvas.toDataURL('image/png');
                const enlaceTemporal = document.createElement('a');
                enlaceTemporal.href = imagenURL;
                enlaceTemporal.download = 'curriculum-descargado.png';
                
                document.body.appendChild(enlaceTemporal);
                enlaceTemporal.click();
                document.body.removeChild(enlaceTemporal);
            }).catch(error => {
                console.error('Hubo un error al generar la imagen PNG:', error);
            });
        });
    } else {
        console.warn("No se encontró un botón de exportación ('btn-exportar-pdf' o 'btn-descargar-png') en el HTML.");
    }
});

function actualizarCV() {
    const safeSetText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    const safeGetValue = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : "";
    };

    const nombre = safeGetValue("input-nombre");
    const apellido = safeGetValue("input-apellido");
    safeSetText("cv-nombre-apellido-output", `${nombre} ${apellido}`.trim());
    
    safeSetText("cv-puesto-output", safeGetValue("input-puesto"));
    safeSetText("cv-telefono-output", safeGetValue("input-telefono"));
    safeSetText("cv-email-output", safeGetValue("input-email"));
    safeSetText("cv-ubicacion-output", safeGetValue("input-ubicacion"));
    safeSetText("cv-sobremi-output", safeGetValue("input-sobremi"));
    safeSetText("cv-educacion-output", safeGetValue("input-educacion"));

    const cursosTexto = safeGetValue("input-cursos");
    const listaCursos = document.getElementById("cv-cursos-output");
    if (listaCursos) {
        listaCursos.innerHTML = "";
        if (cursosTexto.trim() !== "") {
            const lineasCursos = cursosTexto.split("\n");
            lineasCursos.forEach(curso => {
                if (curso.trim() !== "") {
                    const li = document.createElement("li");
                    li.textContent = curso.trim();
                    listaCursos.appendChild(li);
                }
            });
        }
    }

    const contenedorExp = document.getElementById("cv-experiencia-output");
    if (contenedorExp) {
        contenedorExp.innerHTML = "";

        const empresa1 = safeGetValue("input-empresa1");
        const cargo1 = safeGetValue("input-cargo1");
        const funciones1 = safeGetValue("input-funciones1");

        if (empresa1 || cargo1 || funciones1) {
            contenedorExp.innerHTML += `
                <div class="cv-job-container">
                    <div class="cv-job-title">${cargo1}</div>
                    <div class="cv-job-company">${empresa1}</div>
                    <p style="white-space: pre-line;">${funciones1}</p>
                </div>
            `;
        }

        const empresa2 = safeGetValue("input-empresa2");
        const cargo2 = safeGetValue("input-cargo2");
        const funciones2 = safeGetValue("input-funciones2");

        if (empresa2 || cargo2 || funciones2) {
            contenedorExp.innerHTML += `
                <div class="cv-job-container" style="margin-top: 10px;">
                    <div class="cv-job-title">${cargo2}</div>
                    <div class="cv-job-company">${empresa2}</div>
                    <p style="white-space: pre-line;">${funciones2}</p>
                </div>
            `;
        }
    }

    let refPersHtml = "";
    const rpNombre1 = safeGetValue("input-refpers-nombre1");
    const rpTel1 = safeGetValue("input-refpers-tel1");
    if (rpNombre1 || rpTel1) {
        refPersHtml += `${rpNombre1}\nTel: ${rpTel1}\n\n`;
    }
    const rpNombre2 = safeGetValue("input-refpers-nombre2");
    const rpTel2 = safeGetValue("input-refpers-tel2");
    if (rpNombre2 || rpTel2) {
        refPersHtml += `${rpNombre2}\nTel: ${rpTel2}`;
    }
    safeSetText("cv-refpers-output", refPersHtml.trim());

    let refLabHtml = "";
    const rlNombre1 = safeGetValue("input-reflab-nombre1");
    const rlTel1 = safeGetValue("input-reflab-tel1");
    if (rlNombre1 || rlTel1) {
        refLabHtml += `${rlNombre1}\nTel: ${rlTel1}\n\n`;
    }
    const rlNombre2 = safeGetValue("input-reflab-nombre2");
    const rlTel2 = safeGetValue("input-reflab-tel2");
    if (rlNombre2 || rlTel2) {
        refLabHtml += `${rlNombre2}\nTel: ${rlTel2}`;
    }
    safeSetText("cv-reflab-output", refLabHtml.trim());
}