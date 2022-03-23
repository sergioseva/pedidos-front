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
             resolve(true);
             console.log(`apuntando a ${config.baseUrl}`);
           }),
           catchError((x: { status: number }, caught: Observable<void>): ObservableInput<{}> => {
             if (x.status !== 404) {
               resolve(false);
             }
             config.baseUrl = 'https://pedidos.librosmario.store:8443';
             config.nombre = 'Test Libros Mario Gualeguaychú';
             config.direccion = 'Test 3 de Caballeria 761 - Gualeguaychu';
             config.telefono = 'Test Telefono: 425900';
             //config.baseUrl = 'http://localhost:8080';
             //config.baseUrl = 'http://157.245.208.76:8080';
             console.log(`apuntando a ${config.baseUrl}`);
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
