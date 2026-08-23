/** Una linea del estado de cuenta con lo que se marco vendido y devuelto. */
export class LineaLiquidacionModel {
    isbn: string;
    nombreLibro: string;
    autor: string;
    editorial: string;
    precio: number;
    cantidadVendida = 0;
    cantidadDevuelta = 0;
}

export class LiquidacionModel {
    comercioId: number;
    lineas: LineaLiquidacionModel[] = [];
    observaciones: string;
    /** Si el comercio pago en el acto se emite el recibo; si no, el remito de venta queda impago. */
    registrarPago = false;
    medioPago: string;
}

/** Documentos que emitio una liquidacion. */
export class LiquidacionResultadoModel {
    remitoRetiroId: number;
    remitoVentaId: number;
    reciboId: number;
    totalTapa: number;
    comision: number;
    netoAPagar: number;
}
