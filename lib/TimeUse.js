"use strict";
/**
 * @file XTimeUse - Multi-stage time profiling utility
 * @author imcooder
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.XTimeUse = void 0;
/**
 * Enhanced timer class with support for multiple independent tag-based timers
 *
 * Features:
 * - Default timer (no tag): simple stopwatch usage
 * - Tag timers: each tag tracks independently, supports start/restart/stop/elapsed
 * - Unstarted tags: stop/elapsed on an unstarted tag measures from default start_time
 *
 * @example
 * // 1. Simple usage (no tag)
 * const timer = new XTimeUse();
 * // ... some operations ...
 * const elapsed = timer.stop(); // ms since creation
 *
 * // 2. Multi-stage profiling with tags
 * const timer = new XTimeUse();
 *
 * timer.start('connect');
 * // ... connect ...
 * const connectTime = timer.stop('connect');
 *
 * timer.start('query');
 * // ... query ...
 * const queryTime = timer.stop('query');
 *
 * console.log(`total:${timer.stop()}ms connect:${connectTime}ms query:${queryTime}ms`);
 *
 * // 3. Stop without explicit start - measures from creation time
 * const processTime = timer.stop('process');
 */
class XTimeUse {
    constructor() {
        this.startTime = Date.now();
        this.tags = new Map();
    }
    /**
     * Start timing for a tag
     * @param tag - timer label. If omitted, resets the default timer
     */
    start(tag) {
        if (tag == null) {
            this.startTime = Date.now();
        }
        else {
            this.tags.set(tag, { start: Date.now(), end: null });
        }
    }
    /**
     * Stop timing and return elapsed milliseconds
     * @param tag - timer label. If omitted, returns default timer elapsed time.
     *              If tag was never started, measures from default start_time.
     *              If tag was already stopped, returns the cached result.
     * @returns elapsed time in milliseconds
     */
    stop(tag) {
        const now = Date.now();
        if (tag == null) {
            return now - this.startTime;
        }
        const info = this.tags.get(tag);
        // already stopped, return cached elapsed
        if (info && info.end != null) {
            return info.end - info.start;
        }
        // get start time, fall back to default startTime if never started
        const tagStart = info ? info.start : this.startTime;
        if (!info) {
            this.tags.set(tag, { start: tagStart, end: now });
        }
        else {
            info.end = now;
        }
        return now - tagStart;
    }
    /**
     * Restart timing, returning the previous segment's elapsed milliseconds
     * @param tag - timer label. If omitted, resets the default timer
     * @returns previous segment elapsed time in milliseconds
     */
    restart(tag) {
        const elapsed = this.stop(tag);
        this.start(tag);
        return elapsed;
    }
    /**
     * Get current elapsed time without stopping the timer (milliseconds)
     * @param tag - timer label. If omitted, returns default timer elapsed time.
     *              If tag was already stopped, returns the cached result.
     * @returns current elapsed time in milliseconds
     */
    elapsed(tag) {
        const now = Date.now();
        if (tag == null) {
            return now - this.startTime;
        }
        const info = this.tags.get(tag);
        // already stopped, return cached elapsed
        if (info && info.end != null) {
            return info.end - info.start;
        }
        // still running, return current elapsed without recording end
        const tagStart = info ? info.start : this.startTime;
        return now - tagStart;
    }
    /**
     * Get the start timestamp (milliseconds)
     * @param tag - timer label. If omitted, returns default timer start time.
     *              If tag was never started, returns default start_time.
     * @returns start timestamp in milliseconds
     */
    get(tag) {
        if (tag == null) {
            return this.startTime;
        }
        const info = this.tags.get(tag);
        return info ? info.start : this.startTime;
    }
}
exports.XTimeUse = XTimeUse;
//# sourceMappingURL=TimeUse.js.map