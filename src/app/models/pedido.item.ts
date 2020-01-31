import { DistribuidoraModel } from './distribuidora.model';
export class PedidoItemModel {
    codigoLuongo: string;
    libro: string;
    autor: string;
    editorial: string;
    isbn: string;
    precio: number;
    cantidad: number;
    distribuidora: DistribuidoraModel;
}