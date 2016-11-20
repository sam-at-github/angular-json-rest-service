/**
 * Sample root module.
 *  - As simple stub root Component.
 *  - setup to mock Http with InMemoryWebApiModule
 *  - rxjs-extensions to add missing function to Observable.
 */
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';
import './rxjs-extensions'; // Mixin operators to Observable.

import { AppComponent }  from './app.component';

@NgModule({
  imports:      [
    BrowserModule,
    HttpModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService),
  ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
