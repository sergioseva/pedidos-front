import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { HomeComponent } from './components/home/home.component';


//routes
import { RouterModule } from '@angular/router';
import { ROUTES } from './app.routes';

import { HttpClientModule, HttpClientJsonpModule, HttpClient } from '@angular/common/http';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { PedidoLibrosPipe } from './pipes/pedido-libros.pipe';

//locale
import { registerLocaleData, DatePipe } from '@angular/common';
import localeAr from '@angular/common/locales/es-AR';
registerLocaleData(localeAr);
//pagination
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';
import { from, of, Observable, ObservableInput } from 'rxjs';
import { ClienteComponent } from './components/cliente/cliente/cliente.component';
import { LibrosComponent } from './components/libros/libros.component';
import { LibroImagenPipe } from './pipes/libro-imagen.pipe';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { PedidoComponent } from './components/pedido/pedido.component';
import { ConfigService } from './providers/config.service';
import { catchError, map } from 'rxjs/operators';
import { PedidoItemComponent } from './components/pedido-item/pedido-item.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DisableControlDirective } from './directives/disable-control.directive';
import { PrintLayoutComponent } from './components/impresiones/print-layout/print-layout.component';
import { PedidoImpresoComponent } from './components/impresiones/pedido-impreso/pedido-impreso.component';
import { PedidoDistribuidoraComponent } from './components/pedido-distribuidora/pedido-distribuidora.component';

function load(http: HttpClient, config: ConfigService): (() => Promise<boolean>) {
  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve: (a: boolean) => void): void => {
       http.get('./config.json')
         .pipe(
           map((x: ConfigService) => {
             config.baseUrl = x.baseUrl;
             config.nombre = x.nombre;
             config.direccion = x.direccion;
             config.telefono = x.telefono;             
             console.log(`config.json leido`);
             console.log(`apuntando a ${config.baseUrl}`);
             console.log(`leido nombre ${config.nombre}`);
             resolve(true);
           }),
           catchError((x: { status: number }, caught: Observable<void>): ObservableInput<{}> => {
             const origin = window.location.origin;
             const host = window.location.hostname;
             config.baseUrl = host === 'localhost'
               ? 'http://localhost:8080'
               : 'https://pedidos.librosmario.store:8443';
             config.nombre = 'Libros Mario Gualeguaychú';
             config.direccion = '3 de Caballeria 761 - Gualeguaychu';
             config.telefono = 'Telefono: 425900';
             console.warn(`config.json no encontrado, usando fallback`);
             console.log(`apuntando a ${config.baseUrl}`);
             if (x.status !== 404) {
               resolve(false);
             }
             resolve(true);
             return of({});
           })
         ).subscribe();
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ClientesComponent,
    HomeComponent,
    PedidosComponent,
    PedidoLibrosPipe,
    RegistroComponent,
    LoginComponent,
    ClienteComponent,
    LibrosComponent,
    LibroImagenPipe,
    PedidoComponent,
    PedidoItemComponent,
    DisableControlDirective,
    PrintLayoutComponent,
    PedidoImpresoComponent,
    PedidoDistribuidoraComponent,
  ],

  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    RouterModule.forRoot(ROUTES),
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    Ng2SmartTableModule,
    NgSelectModule
  ],

  providers: [DatePipe,
    {
      provide: APP_INITIALIZER,
      useFactory: load,
      deps: [
        HttpClient,
        ConfigService
      ],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
