/** Punto de venta que recibe libros en consignacion: un hotel, un almacen, un kiosco. */
export class ComercioModel {
    id: number;
    descripcion: string;
    direccion: string;
    contacto: string;
    telefono: string;
    cuit: string;
    /** Porcentaje que el negocio retiene de cada venta (0-100). */
    comision: number;

    constructor(id?, descripcion?, direccion?, contacto?, telefono?, cuit?, comision?) {
        this.id = id;
        this.descripcion = descripcion;
        this.direccion = direccion;
        this.contacto = contacto;
        this.telefono = telefono;
        this.cuit = cuit;
        this.comision = comision;
    }
}
