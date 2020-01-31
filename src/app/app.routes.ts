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



export const ROUTES: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'libros', component: LibrosComponent, canActivate: [AuthGuard] },
    { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },
    { path: 'cliente/:id', component: ClienteComponent, canActivate: [AuthGuard] },
    { path: 'clientes/:page', component: ClientesComponent, canActivate: [AuthGuard] },
    { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard] },
    { path: 'pedido', component: PedidoComponent, canActivate: [AuthGuard] },
    { path: 'registro', component: RegistroComponent },
    { path: 'login', component: LoginComponent },
    { path: '**', component: HomeComponent },


];
