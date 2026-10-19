import { spawn } from 'node:child_process';
import { delimiter } from 'node:path';
import { StringDecoder } from 'node:string_decoder';

export interface RunCommandOptions {
    /** Kill the process with SIGKILL after this many milliseconds. */
    timeoutMs?: number;
    /** Kill the process and resolve with `aborted: true` when this signal aborts. */
    signal?: AbortSignal;
    /** Working directory of the child. */
    cwd?: string;
    /** Extra environment variables merged over the parent's; `prependPath` is applied on top. */
    env?: Record<string, string | undefined>;
    /** Directories put in front of the child's PATH; the parent's PATH is untouched. */
    prependPath?: string[];
    /** Keep stdout in the result (ignored by default). */
    captureStdout?: boolean;
    /** Maximum characters kept in `stdout`, default 65536. */
    stdoutMaxChars?: number;
    /** Maximum characters kept in `stderr`, default 65536. */
    stderrMaxChars?: number;
    /** Which end of stdout survives when it exceeds the cap, default 'head'. */
    stdoutKeep?: 'head' | 'tail';
    /** Which end of stderr survives when it exceeds the cap, default 'tail' (errors come last). */
    stderrKeep?: 'head' | 'tail';
    /** Called with every decoded stdout chunk as it arrives, regardless of the cap. */
    onStdout?: (chunk: string) => void;
    /** Called with every decoded stderr chunk as it arrives, regardless of the cap. */
    onStderr?: (chunk: string) => void;
}

export interface RunCommandResult {
    code: number | null;
    signal: NodeJS.Signals | null;
    timedOut: boolean;
    aborted: boolean;
    stdout: string;
    stderr: string;
    stdoutTruncated: boolean;
    stderrTruncated: boolean;
    spawnError: string | null;
}

const DEFAULT_CAP = 64 * 1024;
const EXIT_GRACE_MS = 500;

class Capture {
    public text = '';
    public truncated = false;

    public constructor(
        private readonly _max: number,
        private readonly _keep: 'head' | 'tail',
    ) {}

    public push(chunk: string): void {
        if (this._keep === 'head') {
            if (this.text.length >= this._max) {
                this.truncated = this.truncated || chunk.length > 0;
                return;
            }
            const room = this._max - this.text.length;
            this.text += chunk.slice(0, room);
            this.truncated = this.truncated || chunk.length > room;
            return;
        }
        this.text += chunk;
        if (this.text.length > this._max) {
            this.text = this.text.slice(this.text.length - this._max);
            this.truncated = true;
        }
    }
}

function safeCall(fn: ((chunk: string) => void) | undefined, chunk: string): void {
    if (!fn) {
        return;
    }
    try {
        fn(chunk);
    } catch {
        return;
    }
}

function setEnv(env: NodeJS.ProcessEnv, name: string, value: string | undefined): void {
    const existing =
        process.platform === 'win32'
            ? Object.keys(env).find((key) => key.toUpperCase() === name.toUpperCase())
            : undefined;
    const key = existing ?? name;
    if (value === undefined) {
        delete env[key];
    } else {
        env[key] = value;
    }
}

function buildEnv(
    extra: Record<string, string | undefined> | undefined,
    prepend: string[] | undefined,
): NodeJS.ProcessEnv {
    if (!extra && (!prepend || prepend.length === 0)) {
        return process.env;
    }
    const env: NodeJS.ProcessEnv = { ...process.env };
    for (const [name, value] of Object.entries(extra ?? {})) {
        setEnv(env, name, value);
    }
    if (prepend && prepend.length > 0) {
        const key = Object.keys(env).find((name) => name.toUpperCase() === 'PATH') ?? 'PATH';
        const existing = env[key];
        env[key] = [...prepend, ...(existing ? [existing] : [])].join(delimiter);
    }
    return env;
}

/** True when the process started, exited with code 0 and was neither timed out nor aborted. */
export function commandSucceeded(result: RunCommandResult): boolean {
    return result.code === 0 && !result.timedOut && !result.aborted && result.spawnError === null;
}

/**
 * Run an executable without blocking the event loop and always resolve with a result.
 * Never rejects: spawn failures, timeouts and aborts are reported in the result fields.
 */
export function runCommand(
    executable: string,
    args: string[],
    options: RunCommandOptions = {},
): Promise<RunCommandResult> {
    return new Promise<RunCommandResult>((resolve) => {
        const result: RunCommandResult = {
            code: null,
            signal: null,
            timedOut: false,
            aborted: false,
            stdout: '',
            stderr: '',
            stdoutTruncated: false,
            stderrTruncated: false,
            spawnError: null,
        };
        const { signal, timeoutMs } = options;
        if (signal?.aborted) {
            result.aborted = true;
            resolve(result);
            return;
        }
        const wantStdout = options.captureStdout === true || options.onStdout !== undefined;
        const stdout = new Capture(options.stdoutMaxChars ?? DEFAULT_CAP, options.stdoutKeep ?? 'head');
        const stderr = new Capture(options.stderrMaxChars ?? DEFAULT_CAP, options.stderrKeep ?? 'tail');
        const stdoutDecoder = new StringDecoder('utf8');
        const stderrDecoder = new StringDecoder('utf8');
        let child: ReturnType<typeof spawn>;
        try {
            child = spawn(executable, args, {
                stdio: ['ignore', wantStdout ? 'pipe' : 'ignore', 'pipe'],
                windowsHide: true,
                env: buildEnv(options.env, options.prependPath),
                cwd: options.cwd,
            });
        } catch (err) {
            result.spawnError = err instanceof Error ? err.message : String(err);
            resolve(result);
            return;
        }

        let settled = false;
        const kill = (): void => {
            try {
                child.kill('SIGKILL');
            } catch {
                return;
            }
        };
        const timer =
            timeoutMs === undefined
                ? null
                : setTimeout(() => {
                      result.timedOut = true;
                      kill();
                  }, timeoutMs);
        const onAbort = (): void => {
            result.aborted = true;
            kill();
        };
        signal?.addEventListener('abort', onAbort, { once: true });
        const settle = (): void => {
            if (settled) {
                return;
            }
            settled = true;
            if (timer !== null) {
                clearTimeout(timer);
            }
            signal?.removeEventListener('abort', onAbort);
            resolve(result);
        };

        child.stdout?.on('data', (chunk: Buffer) => {
            const text = stdoutDecoder.write(chunk);
            if (options.captureStdout) {
                stdout.push(text);
            }
            safeCall(options.onStdout, text);
        });
        child.stderr?.on('data', (chunk: Buffer) => {
            const text = stderrDecoder.write(chunk);
            stderr.push(text);
            safeCall(options.onStderr, text);
        });
        const finish = (): void => {
            const stdoutTail = stdoutDecoder.end();
            if (stdoutTail && options.captureStdout) {
                stdout.push(stdoutTail);
            }
            const stderrTail = stderrDecoder.end();
            if (stderrTail) {
                stderr.push(stderrTail);
            }
            result.stdout = stdout.text;
            result.stderr = stderr.text;
            result.stdoutTruncated = stdout.truncated;
            result.stderrTruncated = stderr.truncated;
            settle();
        };
        let graceTimer: ReturnType<typeof setTimeout> | null = null;
        child.on('error', (err) => {
            result.spawnError = err.message;
            finish();
        });
        child.on('exit', (code, sig) => {
            result.code = code;
            result.signal = sig;
            graceTimer = setTimeout(() => {
                child.stdout?.destroy();
                child.stderr?.destroy();
                finish();
            }, EXIT_GRACE_MS);
        });
        child.on('close', (code, sig) => {
            if (graceTimer !== null) {
                clearTimeout(graceTimer);
            }
            result.code = code;
            result.signal = sig;
            finish();
        });
    });
}
