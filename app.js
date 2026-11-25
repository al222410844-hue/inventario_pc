
const API = "conexion.php";
const LIMITE_STOCK = 5;

const formulario = document.getElementById("formEquipo");
const tabla = document.getElementById("tablaEquipos");

const equipoId = document.getElementById("equipoId");
const nombre = document.getElementById("nombre");
const categoria = document.getElementById("categoria");
const precio = document.getElementById("precio");
const stock = document.getElementById("stock");

const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const buscar = document.getElementById("buscar");

const tituloFormulario = document.getElementById("tituloFormulario");

const totalProductos = document.getElementById("totalProductos");
const totalStock = document.getElementById("totalStock");
const stockBajo = document.getElementById("stockBajo");
const agotados = document.getElementById("agotados");

const panelAlertas = document.getElementById("panelAlertas");
const totalEquipos = document.getElementById("totalEquipos");

let equipos = [];

// CONSULTAR INVENTARIO
async function cargarEquipos() {

    try {

        const respuesta = await fetch(API);
        const datos = await respuesta.json();

        if (!respuesta.ok || !Array.isArray(datos)) {
            throw new Error("No se pudo consultar el inventario.");
        }

        equipos = datos;

        actualizarIndicadores();
        mostrarAlertas();
        mostrarEquipos();

    } catch (error) {

        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    No se pudo cargar el inventario.
                    Revisa la conexión con MySQL.
                </td>
            </tr>
        `;

        panelAlertas.textContent = error.message;
    }
}

// ACTUALIZAR INDICADORES
function actualizarIndicadores() {

    const unidades = equipos.reduce(
        (total, equipo) => total + Number(equipo.stock),
        0
    );

    const bajos = equipos.filter(
        equipo => Number(equipo.stock) > 0 &&
                  Number(equipo.stock) <= LIMITE_STOCK
    );

    const sinStock = equipos.filter(
        equipo => Number(equipo.stock) === 0
    );

    totalProductos.textContent = equipos.length;
    totalStock.textContent = unidades;
    stockBajo.textContent = bajos.length;
    agotados.textContent = sinStock.length;
}

// MOSTRAR ALERTAS
function mostrarAlertas() {

    panelAlertas.innerHTML = "";

    const sinStock = equipos.filter(
        equipo => Number(equipo.stock) === 0
    );

    const bajos = equipos.filter(
        equipo => Number(equipo.stock) > 0 &&
                  Number(equipo.stock) <= LIMITE_STOCK
    );

    if (sinStock.length === 0 && bajos.length === 0) {

        const mensaje = document.createElement("div");
        mensaje.className = "alert alert-success mb-0";
        mensaje.textContent = "✓ Todos los equipos tienen stock suficiente.";

        panelAlertas.appendChild(mensaje);
        return;
    }

    sinStock.forEach(equipo => {

        const alerta = document.createElement("div");
        alerta.className = "alert alert-danger alerta-item";

        const texto = document.createElement("strong");
        texto.textContent = "🔴 Agotado: ";

        alerta.append(
            texto,
            document.createTextNode(
                equipo.nombre + " no tiene unidades disponibles."
            )
        );

        panelAlertas.appendChild(alerta);
    });

    bajos.forEach(equipo => {

        const alerta = document.createElement("div");
        alerta.className = "alert alert-warning alerta-item";

        const texto = document.createElement("strong");
        texto.textContent = "⚠️ Stock bajo: ";

        alerta.append(
            texto,
            document.createTextNode(
                equipo.nombre + " tiene solamente " +
                equipo.stock + " unidades."
            )
        );

        panelAlertas.appendChild(alerta);
    });
}

// MOSTRAR TABLA
function mostrarEquipos() {

    const texto = buscar.value.toLowerCase();

    const filtrados = equipos.filter(equipo =>
        equipo.nombre.toLowerCase().includes(texto) ||
        equipo.categoria.toLowerCase().includes(texto)
    );

    tabla.innerHTML = "";

    if (filtrados.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    No se encontraron equipos.
                </td>
            </tr>
        `;

        totalEquipos.textContent = "Equipos encontrados: 0";
        return;
    }

    filtrados.forEach(equipo => {

        const fila = document.createElement("tr");

        const valores = [
            equipo.id,
            equipo.nombre,
            equipo.categoria,
            "$" + Number(equipo.precio).toFixed(2),
            equipo.stock
        ];

        valores.forEach(valor => {

            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);

        });

        // ESTADO DEL STOCK
        const celdaEstado = document.createElement("td");
        const estado = document.createElement("span");

        if (Number(equipo.stock) === 0) {

            estado.className = "badge bg-danger";
            estado.textContent = "Agotado";

        } else if (Number(equipo.stock) <= LIMITE_STOCK) {

            estado.className = "badge bg-warning text-dark";
            estado.textContent = "Stock bajo";

        } else {

            estado.className = "badge bg-success";
            estado.textContent = "Disponible";
        }

        celdaEstado.appendChild(estado);
        fila.appendChild(celdaEstado);

        // ACCIONES
        const acciones = document.createElement("td");

        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.className = "btn btn-warning btn-sm me-2";
        editar.addEventListener("click", () => editarEquipo(equipo.id));

        const eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.className = "btn btn-danger btn-sm";
        eliminar.addEventListener("click", () => eliminarEquipo(equipo.id));

        acciones.append(editar, eliminar);
        fila.appendChild(acciones);

        tabla.appendChild(fila);
    });

    totalEquipos.textContent =
        "Equipos encontrados: " + filtrados.length;
}

// REGISTRAR Y ACTUALIZAR
formulario.addEventListener("submit", async function(evento) {

    evento.preventDefault();

    const datos = {
        id: equipoId.value || null,
        nombre: nombre.value.trim(),
        categoria: categoria.value,
        precio: precio.value,
        stock: stock.value
    };

    try {

        btnGuardar.disabled = true;

        const respuesta = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo guardar.");
        }

        alert(resultado.mensaje);

        limpiarFormulario();

        await cargarEquipos();

    } catch (error) {

        alert(error.message);

    } finally {

        btnGuardar.disabled = false;
    }
});

// EDITAR EQUIPO
function editarEquipo(id) {

    const equipo = equipos.find(item => item.id == id);

    if (!equipo) return;

    equipoId.value = equipo.id;
    nombre.value = equipo.nombre;
    categoria.value = equipo.categoria;
    precio.value = equipo.precio;
    stock.value = equipo.stock;

    tituloFormulario.textContent = "Editar equipo";
    btnGuardar.textContent = "Actualizar";

    btnCancelar.classList.remove("d-none");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ELIMINAR EQUIPO
async function eliminarEquipo(id) {

    if (!confirm("¿Estás seguro de eliminar este equipo?")) {
        return;
    }

    try {

        const respuesta = await fetch(API, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo eliminar.");
        }

        alert(resultado.mensaje);

        await cargarEquipos();

    } catch (error) {

        alert(error.message);
    }
}

// LIMPIAR FORMULARIO
function limpiarFormulario() {

    formulario.reset();

    equipoId.value = "";

    tituloFormulario.textContent = "Registrar nuevo equipo";
    btnGuardar.textContent = "Guardar";

    btnCancelar.classList.add("d-none");
}

// CANCELAR EDICIÓN
btnCancelar.addEventListener("click", limpiarFormulario);

// BUSCADOR
buscar.addEventListener("input", mostrarEquipos);

// INICIAR SISTEMA
cargarEquipos();
