import { Injectable } from '@angular/core';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';
import { VentaModel } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private URLVentasService = '/api/ventas';
  private URLCatalogosService = '/api/catalogos';

  constructor(private chttp: CustomHttpClientService,
              private config: ConfigService) {
    this.URLVentasService = `${config.baseUrl}/ventas`;
    this.URLCatalogosService = `${config.baseUrl}/catalogos`;
  }

  /** Barcode lookup. 404 means "not in the catalog", which the till turns into manual entry. */
  buscarPorIsbn(isbn: string) {
    return this.chttp.get(`${this.URLCatalogosService}/isbn/${encodeURIComponent(isbn)}`);
  }

  crearVenta(venta: VentaModel) {
    return this.chttp.post(this.URLVentasService, venta);
  }

  buscarVentas(parametro: string, fechaDesde: string, fechaHasta: string) {
    const url = `${this.URLVentasService}/search/findByAny?parametro=${parametro ?? ''}`
      + `&fechaDesde=${fechaDesde ?? ''}&fechaHasta=${fechaHasta ?? ''}`;
    return this.chttp.get(url);
  }

  ventasPorDia(fechaDesde: string, fechaHasta: string) {
    const url = `${this.URLVentasService}/estadisticas/porDia`
      + `?fechaDesde=${fechaDesde ?? ''}&fechaHasta=${fechaHasta ?? ''}`;
    return this.chttp.get(url);
  }

  resumen(fechaDesde: string, fechaHasta: string) {
    const url = `${this.URLVentasService}/estadisticas/resumen`
      + `?fechaDesde=${fechaDesde ?? ''}&fechaHasta=${fechaHasta ?? ''}`;
    return this.chttp.get(url);
  }

  /** Downloads the filtered ventas as an .xlsx blob (same filter the screen is showing). */
  descargarReporte(parametro: string, fechaDesde: string, fechaHasta: string) {
    const url = `${this.URLVentasService}/reporte`
      + `?parametro=${encodeURIComponent(parametro ?? '')}`
      + `&fechaDesde=${fechaDesde ?? ''}&fechaHasta=${fechaHasta ?? ''}`;
    return this.chttp.getBlob(url);
  }
}
