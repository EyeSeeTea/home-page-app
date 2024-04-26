export interface InstanceData {
    url: string;
    username?: string;
    password?: string;
    version?: string;
}

export class Instance {
    public readonly url: string;
    private username: string | undefined;
    private password: string | undefined;
    private version: string | undefined;

    constructor(data: InstanceData) {
        this.url = data.url;
        this.username = data.username;
        this.password = data.password;
        this.version = data.version;
    }

    public get auth(): { username: string; password: string } | undefined {
        return this.username && this.password ? { username: this.username, password: this.password } : undefined;
    }
}
