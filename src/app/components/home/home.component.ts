import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from '../../providers/configuracion.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  nombre: string = 'Libros Mario';

  constructor(private configuracionService: ConfiguracionService) { }

  ngOnInit() {
    this.configuracionService.getConfiguracion().subscribe(
      config => {
        if (config.nombre) {
          this.nombre = config.nombre;
        }
      }
    );
  }

}
