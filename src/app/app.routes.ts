import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { ClienteComponent } from './components/cliente/cliente/cliente.component';
import { LibrosComponent } from './components/libros/libros.component';
import { PedidoComponent } from './components/pedido/pedido.component';
import { PrintLayoutComponent } from './components/impresiones/print-layout/print-layout.component';
import { PedidoImpresoComponent } from './components/impresiones/pedido-impreso/pedido-impreso.component';
import { PedidoDistribuidoraComponent } from './components/pedido-distribuidora/pedido-distribuidora.component';



export const ROUTES: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'libros', component: LibrosComponent, canActivate: [AuthGuard] },
    { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },
    { path: 'cliente/:id', component: ClienteComponent, canActivate: [AuthGuard] },
    { path: 'clientes/:page', component: ClientesComponent, canActivate: [AuthGuard] },
    { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard] },
    { path: 'pedidosdistribuidora', component: PedidoDistribuidoraComponent, canActivate: [AuthGuard] },
    { path: 'pedido', component: PedidoComponent, canActivate: [AuthGuard] },
    { path: 'registro', component: RegistroComponent },
    { path: 'login', component: LoginComponent },
    { path: 'print', outlet: 'print', component: PrintLayoutComponent,
            children: [
                        { path: 'printpedido/:pedidoId', component: PedidoImpresoComponent }
            ]
    },
    { path: '**', component: HomeComponent },


];
