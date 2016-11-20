# Overview
This package provides a simple Angular 2 service `JsonRestService`, which is a wrapper of `@angular/http/Http`.

`JsonRestService` expects the remote HTTP service to be a ReST service taking and return JSON with the usual semantics. `JsonRestService` will hydrate records it pulls off the wire into a user defined class implementing `ActiveRecord`. `Model` implements a very basic `ActiveRecord` you can use as a base and extend.

`JsonRestService` is generic like this `JsonRestService<T extends ActiveRecord>`. In order to dynamically create instances of type `T` (for get(), and find()), the `JsonRestService` constructor also requires an instance of `ActiveRecordFactory<T>`.

# Synopis

    import { Component } from '@angular/core';
    import { Http } from '@angular/http';
    import 'angular-json-rest-service/rxjs-extensions';
    import { JsonRestService, ActiveRecordFactory } from 'angular-json-rest-service/json-rest.service';
    // Base implementations of ActiveRecord / ActiveRecordFactory interfaces.
    import { Model } from 'angular-json-rest-service/model';

    class Hero extends Model {
      name: string;
      power(): number {
        return 69;
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

    @Component({
        selector: 'my-app',
        template: `<h1>Hello {{hero.name}}. Your power is {{hero.power()}}</h1>`
    })
    export class AppComponent {
      hero: Hero;
      constructor(private http:Http) {
        var myService = new JsonRestService<Model>(
          http,
          '/root/heroes',
          new HeroFactory()
        )
        this.hero = new Hero(myService)
        myService.find().toPromise().then((m: Hero[]) => {
          this.hero = m[0];
          console.log(m.map(n => n.toJson()))
        })
      }
    }
