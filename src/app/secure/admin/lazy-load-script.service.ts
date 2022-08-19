import { Injectable, Renderer2 } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
export declare class ScriptModel{
    'name': string
    'type': string
}
@Injectable({
  providedIn: 'root'
})
export class LazyLoadScriptService {
    loadedLibraries: { [url: string]: ReplaySubject<string> } = {};
    renderer!: Renderer2;
    document!: Document;
    mlist: Observable<string>[]=[];
    constructor() { }
    loadScripts(arg0: ScriptModel[]) {
        for (const iterator of arg0) {
          this.mlist.push(this.loadScript(iterator.name, iterator.type));
        }
        return this.mlist;
    }
    loadScript(url: string, tag: string): Observable<string> {
        if (this.loadedLibraries[url]) {
            console.log('Script already loaded', url);
            return this.loadedLibraries[url].asObservable();
        }
        console.log('Script not loaded yet', url);
        this.loadedLibraries[url] = new ReplaySubject<string>();

        const el = this.renderer.createElement(tag);
        if (tag === 'link') {
            el.setAttribute('rel', 'stylesheet');
            el.setAttribute('href', url);
        } else {
            el.setAttribute('type', 'text/javascript');
            el.setAttribute('src', url);
        }
        el.onload = () => {
            this.loadedLibraries[url].next(url);
            this.loadedLibraries[url].complete();
        };

        this.document.body.appendChild(el);

        return this.loadedLibraries[url].asObservable();
    }
}
