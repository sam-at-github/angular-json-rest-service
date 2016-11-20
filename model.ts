import { JsonRestService, ActiveRecord, ActiveRecordFactory } from './json-rest.service';
import { Headers, Http, Response } from '@angular/http';

/**
 * Base ActiveRecord implementation using JsonRestService for storage.
 * Model's do their own validation - like a normal object they guard their internal state.
 * Of course we can't ensure the model is valid according to the backend, but we can't help that.
 * Syncronization is done via push() (to remote) and pull() (from remote).
 * The remote data always takes precendence is merged over the Model instance data with merge().
 */
export class Model implements ActiveRecord {
  id: number = -1;

  constructor(private storage: JsonRestService<Model>) {
  }

  push(): Promise<Model> {
    if(this.id >= 0)
      return this.storage.update(this)
    else
      return this.storage.create(this)
  }

  pull(): Promise<Model> {
    if(this.id >= 0)
      return this.storage.get(this.id).then((m: Model) => this.merge(m.toObject()))
    else
      return Promise.resolve(this)
  }

  delete(): Promise<void> {
    return this.storage.delete(this.id).then(() => { this.id = -1; return null; })
  }

  toJson(): string {
    return JSON.stringify(this.toObject())
  }

  toObject(): Object {
    var object = {}
    for(var i in this) {
      if(typeof(this[i]) !== 'function' && typeof(this[i]) !== 'object') {
        object[i] = this[i]
      }
    }
    return object;
  }

  merge(object: Object): Model {
    for(var i in object) {
      this[i] = object[i]
    }
    return this;
  }
}


export class ModelFactory extends ActiveRecordFactory<Model>
{
  create(object: Object, storage: JsonRestService<Model>): Model {
    var model = new Model(storage)
    model.merge(object)
    return model;
  }
}
