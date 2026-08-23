/** Constancia de que el comercio pago un remito de venta de consignacion. */
export class ReciboModel {
    rc_recibo_k: number;
    rc_fecha: Date;
    rc_monto: number;
    rc_medio_pago: string;
    rc_observaciones: string;
}
