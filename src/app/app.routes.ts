import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
/* import { MovieComponent } from './components/movie/movie.component'; */



export const ROUTES: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'clientes', component: ClientesComponent },
    { path: 'clientes/:page', component: ClientesComponent },
    { path: 'pedidos', component: PedidosComponent },
    
    /* { path: 'movie/:id/:pag', component: MovieComponent }, */
    { path: '**', component: HomeComponent },


];
