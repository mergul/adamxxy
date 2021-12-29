import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from './loader.service';

const methods = ['PUT', 'POST', 'DELETE', 'PATCH'];

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private ui: LoaderService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('token');
        if (!methods.includes(request.method) && !request.url.includes('rest/user/') && !request.url.includes('/balance/')) {
            return next.handle(request);
        } else if (request.url.includes('rest/user/') || request.url.includes('/balance/')) {
            const headers = request.headers;
            request = request.clone({
                headers: headers.set('Authorization', `Bearer ${token}`), withCredentials: true
            });
            return next.handle(request);
        } else {
            this.ui.show();
            const headers = request.headers;
            request = request.clone({
                headers: headers.set('Authorization', `Bearer ${token}`), withCredentials: true
            });
            return next.handle(request).pipe(finalize(() => {
                if (this.ui.isLoading.getValue()) { this.ui.hide(); }
            }));
        }
    }
}
