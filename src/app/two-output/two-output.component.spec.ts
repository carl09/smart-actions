import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoOutputComponent } from './two-output.component';

describe('TwoOutputComponent', () => {
  let component: TwoOutputComponent;
  let fixture: ComponentFixture<TwoOutputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TwoOutputComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
