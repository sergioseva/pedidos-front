import { RemitoItemModel } from './remito-item.model';
import { DistribuidoraModel } from './distribuidora.model';

export class RemitoModel {
    re_remito_k: number;
    re_fecha: Date;
    re_distribuidora_ed: DistribuidoraModel;
    re_observaciones: string;
    items: RemitoItemModel[] = new Array();
    finalizado = false;

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
        this.items.forEach(i => total += i.ri_cantidad * i.ri_precio);
        return total;
    }
}
