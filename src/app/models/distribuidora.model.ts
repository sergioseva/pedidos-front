export class DistribuidoraModel {
    id: number;
    descripcion: string;
    nroCuenta: string;
    constructor(id?, descripcion?, nroCuenta?) {
        this.id = id;
        this.descripcion = descripcion;
        this.nroCuenta = nroCuenta;
    }
}
