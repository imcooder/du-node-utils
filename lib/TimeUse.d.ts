/**
 * @file XTimeUse - Multi-stage time profiling utility
 * @author imcooder
 */
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
export declare class XTimeUse {
    private startTime;
    private tags;
    constructor();
    /**
     * Start timing for a tag
     * @param tag - timer label. If omitted, resets the default timer
     */
    start(tag?: string): void;
    /**
     * Stop timing and return elapsed milliseconds
     * @param tag - timer label. If omitted, returns default timer elapsed time.
     *              If tag was never started, measures from default start_time.
     *              If tag was already stopped, returns the cached result.
     * @returns elapsed time in milliseconds
     */
    stop(tag?: string): number;
    /**
     * Restart timing, returning the previous segment's elapsed milliseconds
     * @param tag - timer label. If omitted, resets the default timer
     * @returns previous segment elapsed time in milliseconds
     */
    restart(tag?: string): number;
    /**
     * Get current elapsed time without stopping the timer (milliseconds)
     * @param tag - timer label. If omitted, returns default timer elapsed time.
     *              If tag was already stopped, returns the cached result.
     * @returns current elapsed time in milliseconds
     */
    elapsed(tag?: string): number;
    /**
     * Get the start timestamp (milliseconds)
     * @param tag - timer label. If omitted, returns default timer start time.
     *              If tag was never started, returns default start_time.
     * @returns start timestamp in milliseconds
     */
    get(tag?: string): number;
}
//# sourceMappingURL=TimeUse.d.ts.map