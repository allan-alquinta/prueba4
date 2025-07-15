import React, { useState, useEffect } from "react";
import { db } from "./firebase-config";
import { collection, addDoc } from "firebase/firestore";

function Formulario() {
  const [datos, setDatos] = useState({
    nombre: "",
    edad: "",
    fecha: "",
    descripcion: "",
    categoria: "opcion1",
  });

  const [registros, setRegistros] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [indiceEditar, setIndiceEditar] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const datosGuardados = localStorage.getItem("registros");
    if (datosGuardados) {
      setRegistros(JSON.parse(datosGuardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("registros", JSON.stringify(registros));
  }, [registros]);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const traducirCategoria = (valor) => {
    switch (valor) {
      case "opcion1":
        return "Taller";
      case "opcion2":
        return "Reunión";
      case "opcion3":
        return "Proyecto";
      case "opcion4":
        return "Otros";
      default:
        return "Sin categoría";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombreDuplicado = registros.some(
      (item, idx) =>
        item.nombre.toLowerCase() === datos.nombre.toLowerCase() &&
        (!modoEdicion || idx !== indiceEditar)
    );

    if (nombreDuplicado) {
      setMensaje("⚠️ Ya existe un registro con ese nombre.");
      return;
    }

    const nuevoDato = { ...datos };

    if (modoEdicion) {
      const nuevos = [...registros];
      nuevos[indiceEditar] = nuevoDato;
      setRegistros(nuevos);
      setMensaje("Registro actualizado correctamente.");
      setModoEdicion(false);
      setIndiceEditar(null);
    } else {
      setRegistros([...registros, nuevoDato]);
      setMensaje("Registro creado correctamente.");
      try {
        await addDoc(collection(db, "actividades"), nuevoDato);
      } catch (error) {
        console.error("Error al guardar en Firestore:", error);
      }
    }

    setDatos({
      nombre: "",
      edad: "",
      fecha: "",
      descripcion: "",
      categoria: "opcion1",
    });

    setTimeout(() => {
      setMensaje("");
    }, 3000);
  };

  const handleEditar = (index) => {
    setDatos(registros[index]);
    setModoEdicion(true);
    setIndiceEditar(index);
  };

  const handleEliminar = (index) => {
    const nuevos = registros.filter((_, i) => i !== index);
    setRegistros(nuevos);
    if (indiceEditar === index) {
      setModoEdicion(false);
      setIndiceEditar(null);
      setDatos({
        nombre: "",
        edad: "",
        fecha: "",
        descripcion: "",
        categoria: "opcion1",
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Gestor Responsable (nombre completo del encargado de la actividad):
          <input
            type="text"
            name="nombre"
            value={datos.nombre}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Edad del participante (expresado escrito en años):
          <input
            type="number"
            name="edad"
            value={datos.edad}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Fecha de Actividad (día en que se realiza la actividad):
          <input
            type="date"
            name="fecha"
            value={datos.fecha}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Tipo de Actividad (categoría: taller, reunión, proyecto u otros):
          <select
            name="categoria"
            value={datos.categoria}
            onChange={handleChange}
            required
          >
            <option value="opcion1">Taller</option>
            <option value="opcion2">Reunión</option>
            <option value="opcion3">Proyecto</option>
            <option value="opcion4">Otros</option>
          </select>
        </label>
        <br />

        <label>
          Descripción Detallada de la Actividad (explicación del objetivo, contenido o propósito):
          <textarea
            name="descripcion"
            value={datos.descripcion}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <button type="submit">{modoEdicion ? "Actualizar" : "Enviar"}</button>
        {mensaje && <p>{mensaje}</p>}
      </form>

      <h2>Registros guardados:</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Fecha</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((item, index) => (
            <tr key={index}>
              <td>{item.nombre}</td>
              <td>{item.edad}</td>
              <td>{item.fecha}</td>
              <td>{traducirCategoria(item.categoria)}</td>
              <td>{item.descripcion}</td>
              <td>
                <button onClick={() => handleEditar(index)}>Editar</button>
                <button onClick={() => handleEliminar(index)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Formulario;
