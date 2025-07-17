import React, { useState, useEffect } from "react";
import { db } from "./firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

function Formulario() {
  const [datos, setDatos] = useState({
    nombre: "",
    fechaNacimiento: "",
    edad: "",
    correo: "",
    telefono: "",
    direccion: "",
    fecha: "",
    descripcion: "",
    categoria: "opcion1",
  });

  const [registros, setRegistros] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const calcularEdad = (fecha) => {
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fechaNacimiento") {
      const edadCalculada = calcularEdad(value);
      setDatos((prev) => ({
        ...prev,
        fechaNacimiento: value,
        edad: edadCalculada.toString(),
      }));
    } else {
      setDatos({ ...datos, [name]: value });
    }
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

  const cargarRegistros = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "actividades"));
      const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRegistros(docs);
    } catch (error) {
      console.error("Error al cargar registros:", error);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !datos.nombre ||
      !datos.fechaNacimiento ||
      !datos.correo ||
      !datos.telefono ||
      !datos.direccion ||
      !datos.fecha ||
      !datos.descripcion
    ) {
      setMensaje("⚠️ Todos los campos son obligatorios.");
      return;
    }

    const nuevoDato = { ...datos };

    if (modoEdicion && idEditar) {
      try {
        const docRef = doc(db, "actividades", idEditar);
        await updateDoc(docRef, nuevoDato);
        setMensaje("Registro actualizado correctamente.");
        cargarRegistros();
      } catch (error) {
        console.error("Error al actualizar:", error);
      }
      setModoEdicion(false);
      setIdEditar(null);
    } else {
      try {
        await addDoc(collection(db, "actividades"), nuevoDato);
        setMensaje("Registro creado correctamente.");
        cargarRegistros();
      } catch (error) {
        console.error("Error al guardar en Firestore:", error);
      }
    }

    setDatos({
      nombre: "",
      fechaNacimiento: "",
      edad: "",
      correo: "",
      telefono: "",
      direccion: "",
      fecha: "",
      descripcion: "",
      categoria: "opcion1",
    });

    setTimeout(() => setMensaje(""), 3000);
  };

  const handleEditar = (registro) => {
    setDatos({
      nombre: registro.nombre,
      fechaNacimiento: registro.fechaNacimiento,
      edad: registro.edad,
      correo: registro.correo,
      telefono: registro.telefono,
      direccion: registro.direccion,
      fecha: registro.fecha,
      descripcion: registro.descripcion,
      categoria: registro.categoria,
    });
    setModoEdicion(true);
    setIdEditar(registro.id);
  };

  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, "actividades", id));
      setMensaje("Registro eliminado correctamente.");
      cargarRegistros();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>Gestor Responsable (nombre completo del encargado de la actividad)</label>
        <input type="text" name="nombre" value={datos.nombre} onChange={handleChange} required />

        <label>Fecha de Nacimiento (Ingrese fecha de nacimiento)</label>
        <input type="date" name="fechaNacimiento" value={datos.fechaNacimiento} onChange={handleChange} required />

        <label>Edad</label>
        <input type="number" name="edad" value={datos.edad} readOnly />

        <label>Correo Electrónico (dato de contacto del participante o responsable)</label>
        <input type="email" name="correo" value={datos.correo} onChange={handleChange} required />

        <label>Teléfono de Contacto (número móvil o fijo para contacto directo)</label>
        <input type="tel" name="telefono" value={datos.telefono} onChange={handleChange} required />

        <label>Dirección (indicar claramente calle, sector o localidad)</label>
        <input type="text" name="direccion" value={datos.direccion} onChange={handleChange} required />

        <label>Indique la fecha de la actividad a realizar (día en que se realizará la actividad planificada)</label>
        <input type="date" name="fecha" value={datos.fecha} onChange={handleChange} required />

        <label>Seleccione el tipo de actividad (categoría: taller, reunión, proyecto u otros)</label>
        <select name="categoria" value={datos.categoria} onChange={handleChange} required>
          <option value="opcion1">Taller</option>
          <option value="opcion2">Reunión</option>
          <option value="opcion3">Proyecto</option>
          <option value="opcion4">Otros</option>
        </select>

        <label>Descripción del Proyecto (Redacte el objetivo, actividades, recursos necesarios para la actividad)</label>
        <textarea name="descripcion" value={datos.descripcion} onChange={handleChange} required />

        <button type="submit">{modoEdicion ? "Actualizar" : "Enviar"}</button>
        {mensaje && <p>{mensaje}</p>}
      </form>

      <h2>Registros guardados:</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Fecha Nacimiento</th>
            <th>Edad</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Fecha Actividad</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre}</td>
              <td>{item.fechaNacimiento}</td>
              <td>{item.edad}</td>
              <td>{item.correo}</td>
              <td>{item.telefono}</td>
              <td>{item.direccion}</td>
              <td>{item.fecha}</td>
              <td>{traducirCategoria(item.categoria)}</td>
              <td>{item.descripcion}</td>
              <td>
                <button onClick={() => handleEditar(item)}>Editar registro</button>
                <button onClick={() => handleEliminar(item.id)}>Eliminar registro</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Formulario;
