import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ConfiguracionService } from '../../../providers/configuracion.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  userName$: Observable<string>;
  nombre: string = 'Libros Mario';
  logoUrl: string;
  hasLogo: boolean = false;

  constructor(private router: Router,
              private auth: AuthService,
              private configuracionService: ConfiguracionService) { }

  ngOnInit() {
    this.isLoggedIn$ = this.auth.isLoggedIn;
    this.isAdmin$ = this.auth.isAdmin$;
    this.userName$ = this.auth.userName$;
    this.configuracionService.getConfiguracion().subscribe(
      config => {
        if (config.nombre) {
          this.nombre = config.nombre;
        }
        if (config.hasLogo) {
          this.hasLogo = true;
          this.logoUrl = this.configuracionService.getLogoUrl();
        }
      }
    );
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

}
