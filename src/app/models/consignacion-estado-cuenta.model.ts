/** Una fila del estado de cuenta: cuantos ejemplares de un titulo tiene un comercio en consignacion. */
export class ConsignacionEstadoCuentaModel {
    comercioId: number;
    comercio: string;
    isbn: string;
    nombreLibro: string;
    autor: string;
    editorial: string;
    entregado: number;
    devuelto: number;
    vendido: number;
    /** Saldo en la calle: entregado - devuelto - vendido. */
    cantidad: number;
    precio: number;
    subtotal: number;
}
