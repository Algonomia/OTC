import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HttpUtilsService} from '../http-utils.service';

export type AssetCategory = 'images' | 'misc';

export interface DocumentExportAsset {
    name: string;
    url: string;
    type: DocumentExportAssetType;
    category: AssetCategory;
    alwaysFetch?: boolean;
}

export enum DocumentExportAssetType {
    SVG,
    PNG,
    JSON,
    Fetchable
}

export interface ImageAsset {
    value: string;
    imageSourceWidth: number;
    imageSourceHeight: number;
}

@Injectable({
  providedIn: 'root'
})
export class AssetLoader {
    private _store: {
        images: Record<string, ImageAsset>,
        misc: Record<string, unknown>
    } = { images: {}, misc: {} };

    constructor(private _http: HttpClient) {}

    /** Convert image asset to PNG base64 via offscreen canvas */
    private async _assetInPng(asset: DocumentExportAsset): Promise<{ value: string, imageSourceWidth: number, imageSourceHeight: number }> {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Needed if image is from another origin
        img.decoding = 'async';

        return new Promise((resolve, reject) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context not available'));
                ctx.drawImage(img, 0, 0);
                const base64 = canvas.toDataURL('image/png');
                resolve({
                    value: base64,
                    imageSourceWidth: img.width,
                    imageSourceHeight: img.height
                });
            };
            img.onerror = reject;
            img.src = asset.url;
        });
    }

    /** Scale dimensions to fit within a limit, preserving aspect ratio */
    static enforceDimensionsLimit(imageWidth: number, imageHeight: number, limitToEnforce: number): { width: number, height: number } {
        const ratio = imageWidth / imageHeight;
        let width = imageWidth;
        let height = imageHeight;
        if (imageWidth > imageHeight) {
            if (imageWidth > limitToEnforce) {
                width = limitToEnforce;
                height = limitToEnforce / ratio;
            }
        } else {
            if (imageHeight > limitToEnforce) {
                height = limitToEnforce;
                width = limitToEnforce * ratio;
            }
        }
        return {width, height};
    }

    public async populateSingleAssetToObj(asset: DocumentExportAsset): Promise<void> {
        const store = this._store[asset.category] as Record<string, unknown>;
        if (!asset.alwaysFetch && store[asset.name]) return;
        store[asset.name] = await this._fetchAsset(asset);
    }

    public async populateAssetsObj(assetsToImport: DocumentExportAsset[]): Promise<void> {
        await Promise.all(assetsToImport.map(asset => this.populateSingleAssetToObj(asset)));
    }

    private async _fetchAsset(asset: DocumentExportAsset): Promise<ImageAsset | { value: string }> {
        if (asset.type === DocumentExportAssetType.SVG) {
            return await this._assetInPng(asset)
        }
        if (asset.type === DocumentExportAssetType.PNG) {
            return {
                value: await HttpUtilsService.blobToBase64(
                    await HttpUtilsService.getFile(this._http, asset.url)
                )
            };
        }
        if (asset.type === DocumentExportAssetType.Fetchable) {
            return { value: asset.url }; /** pdfmake lib will fetch asset by itself */
        }
        if (asset.type === DocumentExportAssetType.JSON) {
            return {
                value:
                    JSON.parse(await HttpUtilsService.getFile(this._http, asset.url, 'text'))
            };
        }
        throw new Error('Document export: asset type is unknown.');
    }

    public getMiscAsset(name: string): unknown {
        return this._requireLoaded(this._store.misc, name);
    }

    public getImageAssetValue(name: string): string {
        return this.getImageAsset(name).value;
    }

    public getImageAsset(name: string): ImageAsset {
        return this._requireLoaded(this._store.images, name);
    }

    private _requireLoaded<T>(store: Record<string, T>, name: string): T {
        if (!Object.prototype.hasOwnProperty.call(store, name)) {
            throw new Error(`Asset not loaded: "${name}". Call populateAssetsObj() first.`);
        }
        return store[name];
    }
}
