import { PedidoItemModel } from './pedido.item';
import { ClienteModel } from './cliente.model';
export class PedidoModel {
    id: number;
    senia: number;
    total = 0 ;
    observaciones: string;
    pedidoItems: PedidoItemModel[] = new Array();
    cliente: ClienteModel;
    finalizado = false;
    addPedidoItem(pedidoItem: PedidoItemModel) {
        this.pedidoItems.push(pedidoItem);
        this.calcularTotal();
    }
    removePedidoItem(pedidoItem: PedidoItemModel) {
        const index = this.pedidoItems.indexOf(pedidoItem, 0);
        if (index > -1) {
            this.pedidoItems.splice(index, 1);
        }
        this.calcularTotal();
    }
    calcularTotal() {
        console.log('calcular total');
        this.total = 0;
        this.pedidoItems.forEach(pi => this.total += pi.cantidad * pi.precio);
        console.log(this.pedidoItems);
        console.log(this.total);
    }
}