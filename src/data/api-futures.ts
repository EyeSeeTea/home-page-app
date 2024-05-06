import { CancelableResponse } from "@eyeseetea/d2-api/repositories/CancelableResponse";
import { Future, FutureData } from "../domain/types/Future";
import _ from "lodash";

export function apiToFuture<Data>(res: CancelableResponse<Data>): FutureData<Data> {
    return Future.fromComputation((resolve, reject) => {
        res.getData()
            .then(resolve)
            .catch(err => reject(err ? err.message : "Unknown error"));
        return res.cancel;
    });
}

function joinStrings(strings: Array<string | undefined | null>, joinChar: string): string {
    return _.compact(strings).join(joinChar);
}

export function toFuture<Data>(res: CancelableResponse<Data>): FutureData<Data> {
    return Future.fromComputation((resolve, reject) => {
        res.getData()
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                console.error(err);
                const message =
                    joinStrings([err?.response?.status, err?.response?.data?.message, err?.message], " - ") ||
                    "Unknown error";
                return reject(message.trim());
            });

        return () => res.cancel();
    });
}

export function error<Data>(msg: string): FutureData<Data> {
    return Future.error(msg);
}

export function success<Data>(data: Data): FutureData<Data> {
    return Future.success(data);
}

export function toGenericFuture<Error, Data>(res: CancelableResponse<Data>): Future<Error, Data> {
    return Future.fromComputation((resolve, reject) => {
        res.getData()
            .then(resolve)
            .catch(err => {
                return reject(err);
            });

        return () => res.cancel();
    });
}

export function fromPromise<Data>(res: Promise<Data>): Future<string, Data> {
    return Future.fromComputation((resolve, reject) => {
        res.then(resolve).catch(err => {
            return reject(err.toString());
        });

        return () => {};
    });
}

export function maybeToFuture<Data>(value: Data | undefined, msg: string): FutureData<Data> {
    return value === undefined ? error(msg) : success(value);
}

export function assertFuture<Data>(value$: FutureData<Data | undefined>, msg: string): FutureData<Data> {
    return value$.flatMap(value => (value === undefined ? error(msg) : success(value)));
}
