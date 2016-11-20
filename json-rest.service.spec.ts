/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { HttpModule, Headers, Http, Response } from '@angular/http';
import { Observable }     from 'rxjs';
import { InMemoryWebApiModule, InMemoryDbService } from 'angular-in-memory-web-api';
import './rxjs-extensions';

import { JsonRestService, ActiveRecordFactory } from './json-rest.service';
import { Model, ModelFactory } from './model';

/**
 * Mock remote test service for InMemoryWebApiModule
 */
class InMemoryDataService implements InMemoryDbService {
  createDb() {
    let heroes = [
      {id: 11, name: 'Mr. Nice'},
      {id: 12, name: 'Narco'},
      {id: 13, name: 'Bombasto'},
      {id: 14, name: 'Celeritas'},
      {id: 15, name: 'Magneta'},
      {id: 16, name: 'RubberMan'},
      {id: 17, name: 'Dynama'},
      {id: 18, name: 'Dr IQ'},
      {id: 19, name: 'Magma'},
      {id: 20, name: 'Tornado'}
    ];
    return {heroes};
  }
}

class Hero extends Model {
  name: string;
  power(): number {
    return this.name.codePointAt()
  }
}

class HeroFactory extends ActiveRecordFactory<Hero>
{
  create(object: Object, storage: JsonRestService<Hero>): Hero {
    var model = new Hero(storage)
    model.merge(object)
    return model;
  }
}

describe('Test JsonRestService', function () {
  let http: Http
  let myService: JsonRestService<Hero>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        InMemoryWebApiModule.forRoot(InMemoryDataService),
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    http = TestBed.get(Http);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;
    myService = new JsonRestService<Hero>(
      TestBed.get(Http),
      '/root/heroes',
      new HeroFactory()
    )
  });

  it('should find some record', (done) => {
    myService.find().timeout(4000).toPromise().then((m: Hero[]) => {
       expect(m.length).toBe(10);
       done();
    })
  });

  it('should get one record', (done) => {
    myService.get(11).then((m: Hero) => {
      expect(m.id).toBe(11);
      expect(m.name).toBe('Mr. Nice');
      done();
    })
  });

  it('should pull one record', (done) => {
    var m: Hero = new Hero(myService)
    m.id = 12
    m.pull().then((m: Hero) => {
      expect(m.name).toBe('Narco');
      done();
    });
  });

  it('should push one record', (done) => {
    var m: Hero = new Hero(myService)
    m.id = 33
    m.name = 'Nachos';
    m.push().then((m: Hero) => {
      expect(m.name).toBe('Nachos');
      myService.find().timeout(4000).toPromise().then((m: Hero[]) => {
         expect(m.length).toBe(11);
         done();
      })
    });
  });
});
