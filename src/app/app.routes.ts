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
import { ImportarCatalogoComponent } from './components/importar-catalogo/importar-catalogo.component';
import { RemitoComponent } from './components/remito/remito.component';
import { RemitosComponent } from './components/remitos/remitos.component';
import { RemitoImpresoComponent } from './components/impresiones/remito-impreso/remito-impreso.component';
import { DistribuidorasComponent } from './components/distribuidoras/distribuidoras.component';
import { DistribuidoraComponent } from './components/distribuidora/distribuidora.component';
import { ConfiguracionRemitoComponent } from './components/configuracion-remito/configuracion-remito.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { AdminGuard } from './guards/admin.guard';


export const ROUTES: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'libros', component: LibrosComponent, canActivate: [AuthGuard] },
    { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },
    { path: 'cliente/:id', component: ClienteComponent, canActivate: [AuthGuard] },
    { path: 'clientes/:page', component: ClientesComponent, canActivate: [AuthGuard] },
    { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard] },
    { path: 'pedidosdistribuidora', component: PedidoDistribuidoraComponent, canActivate: [AuthGuard] },
    { path: 'importarcatalogo', component: ImportarCatalogoComponent, canActivate: [AuthGuard] },
    { path: 'pedido', component: PedidoComponent, canActivate: [AuthGuard] },
    { path: 'remito', component: RemitoComponent, canActivate: [AuthGuard] },
    { path: 'remitos', component: RemitosComponent, canActivate: [AuthGuard] },
    { path: 'distribuidoras', component: DistribuidorasComponent, canActivate: [AdminGuard] },
    { path: 'distribuidora/:id', component: DistribuidoraComponent, canActivate: [AdminGuard] },
    { path: 'configuracion-remito', component: ConfiguracionRemitoComponent, canActivate: [AuthGuard] },
    { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AdminGuard] },
    { path: 'usuarios', component: UsuariosComponent, canActivate: [AdminGuard] },
    { path: 'usuario/:id', component: UsuarioComponent, canActivate: [AdminGuard] },
    { path: 'registro', component: RegistroComponent },
    { path: 'login', component: LoginComponent },
    { path: 'print', outlet: 'print', component: PrintLayoutComponent,
            children: [
                        { path: 'printpedido/:pedidoId', component: PedidoImpresoComponent },
                        { path: 'printremito/:remitoId', component: RemitoImpresoComponent }
            ]
    },
    { path: '**', component: HomeComponent },


];
