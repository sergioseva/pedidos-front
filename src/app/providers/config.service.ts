import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  baseUrl: string;
  nombre: string;
  direccion: string;
  telefono: string;
  constructor() { }
}
