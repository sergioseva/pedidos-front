import { Component, OnInit } from '@angular/core';
import { BatchStatisticsService } from '../../providers/batch-statistics.service';
import { BatchStatisticModel } from '../../models/batch-statistic.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-importar-catalogo',
  templateUrl: './importar-catalogo.component.html',
  styleUrls: ['./importar-catalogo.component.css']
})
export class ImportarCatalogoComponent implements OnInit {

  statistics: BatchStatisticModel[] = [];
  loading = true;
  error = false;
  errMessage: string;
  currentPage = 1;
  totalItems = 0;
  pageSize = 10;

  selectedFile: File = null;
  uploading = false;

  constructor(private batchStatisticsService: BatchStatisticsService) { }

  ngOnInit() {
    this.loadPage(1);
  }

  onFileSelected(event) {
    this.selectedFile = event.target.files[0] || null;
  }

  importar() {
    if (!this.selectedFile) {
      return;
    }
    this.uploading = true;
    Swal.fire({
      title: 'Importando',
      text: `Subiendo ${this.selectedFile.name}...`,
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.batchStatisticsService.importCatalogo(this.selectedFile).subscribe(
      resp => {
        this.uploading = false;
        this.selectedFile = null;
        Swal.fire({
          title: 'Importacion finalizada',
          text: 'El archivo fue importado correctamente',
          icon: 'success'
        });
        this.loadPage(1);
      },
      err => {
        this.uploading = false;
        const mensaje = err.status === 413
          ? 'El archivo es demasiado grande. El tamaño máximo permitido es 20MB.'
          : 'Error al importar el catalogo';
        Swal.fire({
          title: 'Error',
          text: mensaje,
          icon: 'error'
        });
      }
    );
  }

  loadPage(page: number) {
    this.loading = true;
    this.error = false;
    this.currentPage = page;
    this.batchStatisticsService.getBatchStatistics(page - 1, this.pageSize).subscribe(
      (resp: any) => {
        this.statistics = resp.content;
        this.totalItems = resp.page.totalElements;
        this.loading = false;
      },
      err => {
        this.loading = false;
        this.error = true;
        this.errMessage = 'Error al cargar las estadisticas de importacion';
      }
    );
  }

  calcularDuracion(starttime: string, endtime: string): string {
    const start = new Date(starttime).getTime();
    const end = new Date(endtime).getTime();
    const diff = Math.abs(end - start) / 1000;
    const mins = Math.floor(diff / 60);
    const secs = Math.floor(diff % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }
}
