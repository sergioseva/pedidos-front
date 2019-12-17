import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isLoggedIn$: Observable<boolean>;
  
  constructor(private router: Router,
              private auth: AuthService) { }

  ngOnInit() {
    this.isLoggedIn$ = this.auth.isLoggedIn;
  }

  buscarLibro(termino:string) {
    console.log(termino);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

}
