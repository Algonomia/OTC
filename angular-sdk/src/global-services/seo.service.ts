import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Router} from '@angular/router';
import {Meta, Title} from '@angular/platform-browser';
import {ALGONOMIA_SDK_CONFIG} from "../sdk-config.token";
import {inject} from "@angular/core";

export interface SeoConfig {
    title: string;
    description: string;
    image?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private readonly _config = inject(ALGONOMIA_SDK_CONFIG);
    private _site_name: string = this._config.siteName;
    private _default_image: string = 'assets/favicons/android-chrome-256x256.png';
    private _baseUrl: string = this._config.siteUrl;

    constructor(
        private _meta: Meta,
        private _title: Title,
        private _router: Router,
        @Inject(DOCUMENT) private _document: Document
    ) {
        if (!this._config.production) {
            this._meta.updateTag({ name: 'robots', content: 'noindex' });
        }
    }

    updateSeo(config: SeoConfig): void {
        const url = this._baseUrl + this._router.url.split('?')[0];
        const image = config.image ?? `${this._baseUrl}/${this._default_image}`;

        this._title.setTitle(config.title);

        this._meta.updateTag({ name: 'description', content: config.description });
        this._meta.updateTag({ property: 'og:site_name', content: this._site_name });
        this._meta.updateTag({ property: 'og:title', content: config.title });
        this._meta.updateTag({ property: 'og:description', content: config.description });
        this._meta.updateTag({ property: 'og:type', content: 'website' });
        this._meta.updateTag({ property: 'og:url', content: url });
        this._meta.updateTag({ property: 'og:image', content: image });
        this._meta.updateTag({ name: 'twitter:card', content: 'summary' });
        this._meta.updateTag({ name: 'twitter:title', content: config.title });
        this._meta.updateTag({ name: 'twitter:description', content: config.description });
        this._meta.updateTag({ name: 'twitter:image', content: image });

        this._updateCanonicalLink(url);
    }

    private _updateCanonicalLink(url: string): void {
        let link = this._document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

        if (!link) {
            link = this._document.createElement('link');
            link.setAttribute('rel', 'canonical');
            this._document.head.appendChild(link);
        }

        link.setAttribute('href', url);
    }
}
