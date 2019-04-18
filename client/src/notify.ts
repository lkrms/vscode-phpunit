import { Progress, CancellationToken } from 'vscode';

interface ProgressOptions {
    message?: string;
    increment?: number;
}

export class Notify {
    private progress: Progress<ProgressOptions> | null = null;
    protected promise: Promise<undefined> | null = null;
    private resolve: Function | null = null;
    private token?: CancellationToken;

    constructor(private window: any) {}

    show(title: string, cancellable = false) {
        this.window.withProgress(
            {
                location: 15,
                title: title,
                cancellable: cancellable,
            },
            (progress: Progress<ProgressOptions>, token: CancellationToken) => {
                this.progress = progress;
                this.token = token;

                return (this.promise = new Promise(
                    (resolve: Function) => (this.resolve = resolve)
                ));
            }
        );
    }

    report(options: ProgressOptions) {
        this.progress.report(options);

        return this;
    }

    hide() {
        if (this.resolve) {
            this.resolve();
        }
        this.progress = null;
        this.resolve = null;
    }
}
