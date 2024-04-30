export class Migration {
    constructor(private name: string, private version: number, private performTask: () => void) {
        this.name = name;
        this.version = version;
        this.performTask = performTask;
    }

    public getName(): string {
        return this.name;
    }

    public run(): void {
        this.performTask();
    }
}
