import type { Fn } from "@thi.ng/api";
import type { ReadonlyVec } from "@thi.ng/vectors";
import type { IDistance } from "./api";
import { knearest } from "./knearest";
import { DIST_SQ } from "./squared";

/**
 * Takes a vector `p`, array of `samples` and a `dist`ance function. Computes
 * and returns index of the sample closest to `p` (according to `dist`, default:
 * {@link DIST_SQ}).
 *
 * @reference
 * Use {@link argminT} for non-vector inputs.
 *
 * https://en.wikipedia.org/wiki/Arg_max#Arg_min
 *
 * @param p
 * @param samples
 * @param dist
 */
export const argmin = (
    p: ReadonlyVec,
    samples: ReadonlyVec[],
    { metric: dist }: IDistance<ReadonlyVec> = DIST_SQ
) => {
    let minD = Infinity;
    let minArg = -1;
    for (let i = 0, n = samples.length; i < n; i++) {
        const d = dist(p, samples[i]);
        if (d < minD) {
            minD = d;
            minArg = i;
        }
    }
    return minArg;
};

/**
 * Similar to {@link argmin}, but for non-vector inputs and taking an additional
 * `key` function. Applies `key` to each item (incl. `p`) to obtain its vector
 * representation, then computes and returns index of the sample closest to `p`
 * (according to `dist`).
 *
 * @reference
 * Use {@link argmin} if all items are vectors already.
 *
 * @param p
 * @param samples
 * @param key
 * @param dist
 */
export const argminT = <T>(
    p: T,
    samples: T[],
    key: Fn<T, ReadonlyVec>,
    dist?: IDistance<ReadonlyVec>
) => argmin(key(p), samples.map(key), dist);

/**
 * Similar to {@link argmin}, but for k-nearest queries.
 *
 * @param k
 * @param p
 * @param samples
 * @param dist
 */
export const argminK = (
    k: number,
    p: ReadonlyVec,
    samples: ReadonlyVec[],
    dist: IDistance<ReadonlyVec> = DIST_SQ
) => {
    const neighborhood = knearest<number>(p, k, Infinity, dist);
    for (let i = 0, n = samples.length; i < n; i++) {
        neighborhood.consider(samples[i], i);
    }
    return neighborhood.values();
};

/**
 * Similar to {@link argminT}, but for k-nearest queries.
 *
 * @param k
 * @param p
 * @param samples
 * @param dist
 */
export const argminKT = <T>(
    k: number,
    p: T,
    samples: T[],
    key: Fn<T, ReadonlyVec>,
    dist?: IDistance<ReadonlyVec>
) => argminK(k, key(p), samples.map(key), dist);
