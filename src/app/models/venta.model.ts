import { VentaItemModel } from './venta.item';
import { ClienteModel } from './cliente.model';

/**
 * The ticket being built at the counter. calcularTotal() is for display only -- the server
 * recomputes the total when the sale is recorded, and its value is the one that counts.
 */
export class VentaModel {
    id: number;
    fecha: Date;
    total = 0;
    observaciones: string;
    cliente: ClienteModel;
    items: VentaItemModel[] = new Array();

    addItem(item: VentaItemModel) {
        this.items.push(item);
        this.calcularTotal();
    }

    removeItem(item: VentaItemModel) {
        const index = this.items.indexOf(item, 0);
        if (index > -1) {
            this.items.splice(index, 1);
        }
        this.calcularTotal();
    }

    /** Lets a repeated scan bump the quantity instead of adding a second identical line. */
    buscarPorIsbn(isbn: string): VentaItemModel {
        return this.items.find(i => i.isbn === isbn);
    }

    calcularTotal() {
        this.total = 0;
        this.items.forEach(i => this.total += i.cantidad * i.precio);
    }
}
