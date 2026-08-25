import { Injectable } from '@angular/core';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';
import { RemitoModel, TIPO_DEVOLUCION } from '../models/remito.model';
import { RemitoItemModel } from '../models/remito-item.model';
import { ConfigService } from './config.service';
import { DistribuidoraModel } from '../models/distribuidora.model';
import { ComercioModel } from '../models/comercio.model';
import { ConsignacionEstadoCuentaModel } from '../models/consignacion-estado-cuenta.model';
import { LiquidacionModel, LiquidacionResultadoModel } from '../models/liquidacion.model';
import { ReciboModel } from '../models/recibo.model';

@Injectable({
  providedIn: 'root'
})
export class RemitosService {

  private URLRemitosService = '/api/remitos';
  private remitosSource = new BehaviorSubject(new RemitoModel());
  currentRemito = this.remitosSource.asObservable();
  private borradorPendiente = new Subject<RemitoModel>();

  constructor(private chttp: CustomHttpClientService,
              private config: ConfigService) {
    this.URLRemitosService = `${config.baseUrl}/remitos`;
    // Toda mutacion del remito termina emitiendo aca, asi que persistir en la emision cubre
    // agregar, borrar y cambiar cantidades sin tener que acordarse en cada metodo.
    this.currentRemito.subscribe(remito => this.guardarBorrador(remito));
    // El servidor se actualiza con un respiro: una carga de decenas de libros no puede disparar
    // una peticion por tecla. El localStorage ya cubrio el instante.
    this.borradorPendiente.pipe(debounceTime(1500))
      .subscribe(remito => this.sincronizarBorrador(remito));
  }

  private claveBorrador(tipo: string): string {
    return `remito-borrador-${tipo}`;
  }

  /**
   * Guarda el remito en curso para que cerrar la pantalla no cueste toda la carga.
   *
   * La regla de que se guarda resuelve sola todo el ciclo de vida: un remito vacio o ya
   * finalizado borra el borrador, asi que reiniciar y grabar lo limpian sin codigo extra.
   */
  private guardarBorrador(remito: RemitoModel) {
    try {
      const clave = this.claveBorrador(remito.re_tipo);
      if (remito.finalizado || !remito.items.length) {
        localStorage.removeItem(clave);
        return;
      }
      localStorage.setItem(clave, JSON.stringify({
        items: remito.items,
        guardadoEn: new Date().toISOString()
      }));
    } catch (e) {
      // Sin espacio o storage bloqueado: el borrador es una comodidad y no puede romper la carga.
    }
    this.borradorPendiente.next(remito);
  }

  /**
   * Copia del borrador en el servidor, que es la que sobrevive a que el navegador limpie sus
   * datos y la que acompana al operador si cambia de maquina.
   */
  private sincronizarBorrador(remito: RemitoModel) {
    const url = `${this.URLRemitosService}/borrador`;
    if (remito.finalizado || !remito.items.length) {
      this.chttp.delete(`${url}?tipo=${remito.re_tipo}`).subscribe({ error: () => null });
      return;
    }
    const contenido = JSON.stringify({ items: remito.items, guardadoEn: new Date().toISOString() });
    this.chttp.put(url, { tipo: remito.re_tipo, contenido }).subscribe({ error: () => null });
  }

  /**
   * Arranca la pantalla con lo que haya quedado sin terminar. Emite cuantos items se recuperaron,
   * para poder avisarlo: restaurar en silencio haria dudar de si son items viejos.
   *
   * Mira las dos copias y se queda con la mas reciente. Ninguna es siempre la buena: el servidor
   * puede estar un instante atras porque la sincronizacion espera, y el navegador puede haber
   * perdido la suya al cerrarse o ser de otra maquina.
   */
  restaurarBorrador(tipo: string = TIPO_DEVOLUCION): Observable<number> {
    const local = this.leerBorradorLocal(tipo);
    return this.chttp.get(`${this.URLRemitosService}/borrador?tipo=${tipo}`).pipe(
      map((respuesta: any) => this.parsearBorrador(respuesta && respuesta.contenido)),
      catchError(() => of(null)),
      map(remoto => {
        const elegido = this.masReciente(local, remoto);
        const remito = new RemitoModel(tipo);
        remito.items = elegido ? elegido.items : [];
        this.remitosSource.next(remito);
        return remito.items.length;
      })
    );
  }

  private leerBorradorLocal(tipo: string): { items: RemitoItemModel[], guardadoEn: string } {
    try {
      return this.parsearBorrador(localStorage.getItem(this.claveBorrador(tipo)));
    } catch (e) {
      try { localStorage.removeItem(this.claveBorrador(tipo)); } catch (e2) { /* ignorado */ }
      return null;
    }
  }

  private parsearBorrador(crudo: string): { items: RemitoItemModel[], guardadoEn: string } {
    if (!crudo) {
      return null;
    }
    try {
      const datos = JSON.parse(crudo);
      const items = (datos.items || []).map(i => Object.assign(new RemitoItemModel(), i));
      return items.length ? { items, guardadoEn: datos.guardadoEn || '' } : null;
    } catch (e) {
      // Un borrador ilegible no sirve de nada y no puede impedir empezar uno nuevo.
      return null;
    }
  }

  private masReciente(a: { guardadoEn: string }, b: { guardadoEn: string }): any {
    if (!a) { return b; }
    if (!b) { return a; }
    return (b.guardadoEn || '') > (a.guardadoEn || '') ? b : a;
  }

  /** Cuantos items tiene el borrador guardado, sin restaurarlo. */
  itemsEnBorrador(tipo: string): number {
    try {
      const crudo = localStorage.getItem(this.claveBorrador(tipo));
      return crudo ? (JSON.parse(crudo).items || []).length : 0;
    } catch (e) {
      return 0;
    }
  }

  /** `tipo` vacio trae devoluciones y consignaciones juntas. */
  buscarRemitos(termino: string, desde: string, hasta: string, tipo = '') {
    const url = `${this.URLRemitosService}/search/findByAny`
      + `?parametro=${termino}&fechaDesde=${desde}&fechaHasta=${hasta}&tipo=${tipo}`;
    return this.chttp.get(url);
  }

  getRemito(id: number) {
    const url = `${this.URLRemitosService}/${id}`;
    return this.chttp.get(url);
  }

  /** Que libros hay entregados en consignacion, agrupados por comercio y titulo. */
  estadoCuentaConsignacion(comercioId: number, desde: string, hasta: string):
      Observable<ConsignacionEstadoCuentaModel[]> {
    const params = [
      comercioId ? `comercioId=${comercioId}` : '',
      desde ? `fechaDesde=${desde}` : '',
      hasta ? `fechaHasta=${hasta}` : ''
    ].filter(p => p).join('&');
    const url = `${this.URLRemitosService}/consignacion/estadocuenta${params ? '?' + params : ''}`;
    return this.chttp.get(url) as Observable<ConsignacionEstadoCuentaModel[]>;
  }

  /**
   * Cierra la cuenta de un comercio. El backend emite el remito de retiro, el de venta y el
   * recibo segun corresponda, y valida contra el saldo real -- no contra el que muestra la
   * pantalla, que pudo quedar viejo.
   */
  liquidarConsignacion(liquidacion: LiquidacionModel): Observable<LiquidacionResultadoModel> {
    const url = `${this.URLRemitosService}/consignacion/liquidar`;
    return this.chttp.post(url, liquidacion) as Observable<LiquidacionResultadoModel>;
  }

  /** Emite el recibo de un remito de venta que habia quedado impago. */
  pagarRemito(remitoId: number, medioPago: string): Observable<ReciboModel> {
    const url = `${this.URLRemitosService}/${remitoId}/recibo?medioPago=${encodeURIComponent(medioPago || '')}`;
    return this.chttp.post(url, {}) as Observable<ReciboModel>;
  }

  getRecibo(remitoId: number): Observable<ReciboModel> {
    return this.chttp.get(`${this.URLRemitosService}/${remitoId}/recibo`) as Observable<ReciboModel>;
  }

  /** El detalle de consignacion de un comercio como .xlsx, con el filtro de la pantalla. */
  descargarReporteConsignacion(comercioId: number, desde: string, hasta: string) {
    const params = [
      `comercioId=${comercioId}`,
      desde ? `fechaDesde=${desde}` : '',
      hasta ? `fechaHasta=${hasta}` : ''
    ].filter(p => p).join('&');
    return this.chttp.getBlob(`${this.URLRemitosService}/consignacion/estadocuenta/reporte?${params}`);
  }

  /** Precio nuevo para un titulo en consignacion. No toca el remito de entrega ya emitido. */
  actualizarPrecioConsignacion(comercioId: number, isbn: string, nombreLibro: string, precio: number) {
    return this.chttp.put(`${this.URLRemitosService}/consignacion/precio`,
      { comercioId, isbn, nombreLibro, precio });
  }

  /** Trae del catalogo los precios vigentes; devuelve cuantos titulos no tuvieron coincidencia. */
  actualizarPreciosDesdeCatalogo(comercioId: number) {
    return this.chttp.post(`${this.URLRemitosService}/consignacion/${comercioId}/precios`, {});
  }

  changeRemito(remito: RemitoModel) {
    this.remitosSource.next(remito);
  }

  addRemitoItem(remitoItem: RemitoItemModel) {
    if (this.remitosSource.getValue().finalizado) {
      return;
    }
    const items: RemitoItemModel[] = this.remitosSource.getValue().items;
    const found: RemitoItemModel = items.find(e => this.claveLibro(e) === this.claveLibro(remitoItem));
    if (found) {
      found.ri_cantidad += remitoItem.ri_cantidad > 0 ? remitoItem.ri_cantidad : 1;
    } else {
      this.remitosSource.getValue().addItem(remitoItem);
    }
    this.remitosSource.getValue().calcularTotal();
    this.remitosSource.next(this.remitosSource.getValue());
  }

  /**
   * Identifica al libro por ISBN Y titulo, la misma clave que usa el backend para los saldos.
   *
   * Antes se comparaba solo el ISBN y ademas se exigia que no fuera vacio, asi que un libro sin
   * ISBN -- que en este catalogo son muchos -- nunca se agrupaba y se sumaba una linea nueva por
   * cada clic. Incluir el titulo tampoco es opcional: medio catalogo tiene el ISBN guardado en
   * notacion cientifica, y por esa via libros distintos comparten cadena y se fusionarian.
   */
  private claveLibro(item: RemitoItemModel): string {
    const norm = (v: string) => (v || '').trim().toLowerCase();
    return `${norm(item.ri_isbn)}|${norm(item.ri_nombre_libro)}`;
  }

  /** La cantidad se edita en la grilla. Nunca baja de 1: para sacar el libro esta el boton de borrar. */
  actualizarCantidad(remitoItem: RemitoItemModel, cantidad: number) {
    if (this.remitosSource.getValue().finalizado) {
      return;
    }
    const n = Math.floor(Number(cantidad) || 0);
    remitoItem.ri_cantidad = n < 1 ? 1 : n;
    this.remitosSource.next(this.remitosSource.getValue());
  }

  removeRemitoItem(remitoItem: RemitoItemModel) {
    if (this.remitosSource.getValue().finalizado) {
      return;
    }
    this.remitosSource.getValue().removeItem(remitoItem);
    this.remitosSource.next(this.remitosSource.getValue());
  }

  finalizarRemito() {
    this.remitosSource.getValue().finalizado = true;
    this.remitosSource.next(this.remitosSource.getValue());
  }

  generarNuevoRemito(tipo: string = TIPO_DEVOLUCION) {
    this.remitosSource.next(new RemitoModel(tipo));
  }

  /**
   * Asigna el destinatario segun el tipo del remito. El lado que no corresponde queda en null:
   * el backend lo limpiaria igual, pero enviarlo confundiria a quien lea el request.
   */
  asignarDatos(destinatario: DistribuidoraModel | ComercioModel, observaciones: string) {
    const remito = this.remitosSource.getValue();
    if (remito.esConsignacion) {
      remito.re_comercio_cm = destinatario as ComercioModel;
      remito.re_distribuidora_ed = null;
    } else {
      remito.re_distribuidora_ed = destinatario as DistribuidoraModel;
      remito.re_comercio_cm = null;
    }
    remito.re_observaciones = observaciones;
    remito.re_fecha = new Date();
    this.remitosSource.next(remito);
  }

  grabarRemito() {
    return this.chttp.post(this.URLRemitosService, this.remitosSource.getValue());
  }

  deleteRemito(id: number) {
    return this.chttp.delete(`${this.URLRemitosService}/${id}`);
  }

}
