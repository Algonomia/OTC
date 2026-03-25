class EnvironmentLoader<IEnv extends Record<string, any>> {
    async load(path: string, requiredKeys: (keyof IEnv)[]): Promise<IEnv> {
        const raw = await this._fetch<IEnv>(path);
        const config = Object.freeze({ ...raw }) as IEnv;
        this._validate(config, requiredKeys);
        return config;
    }

    private async _fetch<T>(path: string): Promise<T> {
        const url = new URL(path, document.baseURI);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to load environment: ${response.status}`);
        }

        return response.json();
    }

    private _validate(config: IEnv, requiredKeys: (keyof IEnv)[]): void {
        const missing = requiredKeys.filter((k) => !config[k]);

        if (missing.length) {
            throw new Error(
                `Missing required environment config: ${(missing as string[]).join(', ')}`
            );
        }
    }
}

export function loadEnvironment<IEnv extends Record<string, any>>(
    path: string,
    requiredKeys: (keyof IEnv)[]
): { environment: IEnv; ready: Promise<void> } {
    const environment = {} as IEnv;

    const ready = new EnvironmentLoader<IEnv>()
        .load(path, requiredKeys)
        .then((config) => {
            Object.assign(environment, config);
            Object.freeze(environment);
        });

    return { environment, ready };
}
