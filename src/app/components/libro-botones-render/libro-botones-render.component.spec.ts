import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibroBotonesRenderComponent } from './libro-botones-render.component';

describe('LibroBotonesRenderComponent', () => {
  let component: LibroBotonesRenderComponent;
  let fixture: ComponentFixture<LibroBotonesRenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibroBotonesRenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibroBotonesRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
