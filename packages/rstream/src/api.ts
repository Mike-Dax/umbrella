import { Fn, Fn0, IDeref, IID, ILogger, NULL_LOGGER } from "@thi.ng/api";
import type { Transducer } from "@thi.ng/transducers";
import type { Stream } from "./stream";
import type { Subscription } from "./subscription";

export enum State {
    IDLE,
    ACTIVE,
    DONE,
    ERROR,
    DISABLED, // TODO currently unused
}

/**
 * Closing behaviors.
 */
export enum CloseMode {
    /**
     * Never close, even if no more inputs/outputs.
     */
    NEVER,
    /**
     * Close when first input/output is done / removed.
     */
    FIRST,
    /**
     * Close when last input/output is done / removed.
     */
    LAST,
}

/**
 * Common base options for all stream / subscription types.
 */
export interface CommonOpts {
    /**
     * Internal ID associated with this stream. If omitted, an
     * autogenerated ID will be used.
     */
    id: string;
    /**
     * If false or `CloseMode.NEVER`, the stream stays active even if
     * all inputs are done. If true (default) or `CloseMode.LAST`, the
     * stream closes when the last input is done. If `CloseMode.FIRST`,
     * the instance closes when the first input is done.
     *
     * @defaultValue CloseMode.LAST
     */
    closeIn: CloseMode;
    /**
     * If false or `CloseMode.NEVER`, the stream stays active once there
     * are no more subscribers. If true (default) or `CloseMode.LAST`,
     * the stream closes when the last subscriber has unsubscribed. If
     * `CloseMode.FIRST`, the instance closes when the first subscriber
     * disconnects.
     *
     * @defaultValue CloseMode.LAST
     */
    closeOut: CloseMode;
    /**
     * If true (default), stream caches last received value and pushes
     * it to new subscriberswhen they subscribe. If false, calling
     * `.deref()` on this stream will always return `undefined`.
     *
     * @defaultValue true
     */
    cache: boolean;
}

export interface WithTransform<A, B> {
    /**
     * Transducer to transform incoming stream values. If given, all
     * child subscriptions will only receive the transformed result
     * values.
     */
    xform: Transducer<A, B>;
}

export interface TransformableOpts<A, B>
    extends CommonOpts,
        WithTransform<A, B> {}

export interface WithErrorHandler {
    /**
     * Optional error handler to use for this
     */
    error: Fn<any, void>;
}

export interface WithErrorHandlerOpts extends CommonOpts, WithErrorHandler {}

export interface SubscriptionOpts<A, B> extends TransformableOpts<A, B> {
    /**
     * Parent stream / subscription.
     */
    parent: ISubscribable<A>;
}

export interface ISubscriber<T> {
    next: Fn<T, void>;
    error?: Fn<any, void>;
    done?: Fn0<void>;
    /**
     * Internal use only. Do not use.
     */
    __owner?: ISubscribable<any>;
    [id: string]: any;
}

export interface ISubscribable<T> extends IDeref<T | undefined>, IID<string> {
    subscribe(
        sub: ISubscriber<T>,
        opts?: Partial<CommonOpts>
    ): Subscription<T, T>;
    subscribe<C>(
        sub: Partial<ISubscriber<T>>,
        xform: Transducer<T, C>,
        opts?: Partial<CommonOpts>
    ): Subscription<T, C>;
    subscribe<C>(sub: Subscription<T, C>): Subscription<T, C>;
    unsubscribe(sub?: Partial<ISubscriber<T>>): boolean;
    getState(): State;
}

export interface ITransformable<B> {
    transform<C>(
        a: Transducer<B, C>,
        opts?: Partial<WithErrorHandlerOpts>
    ): Subscription<B, C>;
    transform<C, D>(
        a: Transducer<B, C>,
        b: Transducer<C, D>,
        opts?: Partial<WithErrorHandlerOpts>
    ): Subscription<B, D>;
    transform<C, D, E>(
        a: Transducer<B, C>,
        b: Transducer<C, D>,
        c: Transducer<D, E>,
        opts?: Partial<WithErrorHandlerOpts>
    ): Subscription<B, E>;
    transform<C, D, E, F>(
        a: Transducer<B, C>,
        b: Transducer<C, D>,
        c: Transducer<D, E>,
        d: Transducer<E, F>,
        opts?: Partial<WithErrorHandlerOpts>
    ): Subscription<B, F>;
    transform<C>(
        opts: WithTransform<B, C> & Partial<WithErrorHandlerOpts>
    ): Subscription<B, C>;
}

export interface ISubscribableSubscriber<T>
    extends ISubscriber<T>,
        ISubscribable<any> {}

export interface IStream<T> extends ISubscriber<T> {
    cancel: StreamCancel;
}

export type StreamCancel = () => void;
export type StreamSource<T> = (sub: Stream<T>) => StreamCancel | void;

export let LOGGER = NULL_LOGGER;

export const setLogger = (logger: ILogger) => (LOGGER = logger);

export const DUMMY: ISubscriber<any> = { next() {} };
