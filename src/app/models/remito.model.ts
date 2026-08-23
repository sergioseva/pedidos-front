import { RemitoItemModel } from './remito-item.model';
import { DistribuidoraModel } from './distribuidora.model';
import { ComercioModel } from './comercio.model';
import { ReciboModel } from './recibo.model';

/** Devolucion de libros a una distribuidora. */
export const TIPO_DEVOLUCION = 'DEVOLUCION';
/** Entrega de libros en consignacion a un punto de venta. */
export const TIPO_CONSIGNACION = 'CONSIGNACION';
/** Retiro de los libros que el comercio no vendio. */
export const TIPO_RETIRO = 'RETIRO';
/** Libros que el comercio vendio y pasa a deber. */
export const TIPO_VENTA_CONSIGNACION = 'VENTA_CONSIGNACION';

/** Los tres tipos cuyo destinatario es un comercio. */
export function esDeComercio(tipo: string): boolean {
    return tipo === TIPO_CONSIGNACION || tipo === TIPO_RETIRO || tipo === TIPO_VENTA_CONSIGNACION;
}

export class RemitoModel {
    re_remito_k: number;
    re_fecha: Date;
    /** Destinatario cuando el tipo es DEVOLUCION. */
    re_distribuidora_ed: DistribuidoraModel;
    /** Destinatario cuando el tipo es CONSIGNACION. */
    re_comercio_cm: ComercioModel;
    re_tipo = TIPO_DEVOLUCION;
    /** Comision congelada del comercio, solo en remitos de venta. */
    re_comision: number;
    /** Presente solo si el comercio ya pago este remito de venta. */
    recibo: ReciboModel;
    pagado = false;
    re_observaciones: string;
    items: RemitoItemModel[] = new Array();
    finalizado = false;

    constructor(tipo: string = TIPO_DEVOLUCION) {
        this.re_tipo = tipo;
    }

    get esConsignacion(): boolean {
        return esDeComercio(this.re_tipo);
    }

    /** Nombre del destinatario, sea distribuidora o comercio, para mostrar sin ramificar en cada vista. */
    get destinatario(): string {
        const dest = this.esConsignacion ? this.re_comercio_cm : this.re_distribuidora_ed;
        return dest ? dest.descripcion : '';
    }

    addItem(item: RemitoItemModel) {
        this.items.push(item);
        this.calcularTotal();
    }

    removeItem(item: RemitoItemModel) {
        const index = this.items.indexOf(item, 0);
        if (index > -1) {
            this.items.splice(index, 1);
        }
        this.calcularTotal();
    }

    calcularTotal(): number {
        let total = 0;
        this.items.forEach(i => total += i.ri_cantidad * (i.ri_precio || 0));
        return total;
    }
}
