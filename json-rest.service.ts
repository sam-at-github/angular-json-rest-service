import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable }     from 'rxjs';
import './rxjs-extensions';

/**
 * Interface for thing [de]hydratable thing according to JsonRestService.
 * Instances know how to sync to JSON and from an object with merge().
 * merge() serves in ~same responsibility as a ~"from(Json|Object)()" method.
 */
export interface ActiveRecord {
  id: number;
  toJson(): string;
  toObject(): Object;
  merge(object: Object): ActiveRecord;
}

export abstract class ActiveRecordFactory<T extends ActiveRecord>
{
  abstract create(object: Object, storage: JsonRestService<T>): T;
}

@Injectable()
export class JsonRestService<T extends ActiveRecord> {
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http, public url: string, private factory: ActiveRecordFactory<T>) {}

  find(query: Object = {}): Observable<T[]> {
    var url = this.url + this.buildQueryString(query)
    return this.http
      .get(url)
      .map((r: Response) => this.hydrateList(r.json().data) as T[])
  }

  get(id: number): Promise<T> {
    const url = `${this.url}/${id}`;
    return this.http
      .get(url)
      .map((r: Response) => this.factory.create(r.json().data, this) as T)
      .toPromise()
  }

  update(object: T): Promise<T> {
    const url = `${this.url}/${object.id}`;
    return this.http
      .put(url, object.toJson(), {headers: this.headers})
      .map((r: Response) => { object.merge(r.json().data); return object; })
      .toPromise()
  }

  create(object: T): Promise<T> {
    delete object.id
    return this.http
      .post(this.url, object.toJson(), {headers: this.headers})
      .map((r: Response) => { object.merge(r.json().data); return object; })
      .toPromise()
  }

  delete(id: number): Promise<void> {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, {headers: this.headers})
      .toPromise().then((r: Response) => null)
  }

  hydrateList(data: any[]) {
    var items: ActiveRecord[] = []
    for(let d of data) {
      var item: ActiveRecord = this.factory.create(d, this)
      items.push(item)
    }
    return items
  }

  buildQueryString(query: Object) {
    var parts: string[] = []
    for(let key in query) {
      var value = query[key].toString()
      parts.push(`${key}=${value}`)
    }
    return parts.length ? '?' + parts.join('&') : ''
  }
}
