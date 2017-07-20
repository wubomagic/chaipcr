import { TestBed, async, inject } from '@angular/core/testing'

import { Title } from '@angular/platform-browser'
import { RouterTestingModule } from '@angular/router/testing'
import { HomeComponent } from './home.component'
import { ExperimentListComponent } from './experiment-list/experiment-list.component'

describe('HomeComponent', () => {

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        HomeComponent,
        ExperimentListComponent,
      ],
      providers: [
        Title
      ]
    }).compileComponents()

  }))

  it('should set title to ChaiPCR | Home', async(() => {
    inject(
      [Title],
      (title: Title) => {

        spyOn(title, 'setTitle').and.callThrough()

        let fixture = TestBed.createComponent(HomeComponent)
        fixture.detectChanges()
        expect(title.setTitle).toHaveBeenCalledWith('ChaiPCR | Home')

      }
    )
  }))

})