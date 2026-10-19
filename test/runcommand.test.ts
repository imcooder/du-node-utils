import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { commandSucceeded, runCommand } from '../src/RunCommand.js';

const NODE = process.execPath;

describe('runCommand', () => {
    it('resolves with the exit code and captured output', async () => {
        const result = await runCommand(
            NODE,
            ['-e', 'process.stdout.write("out");process.stderr.write("err");process.exit(3)'],
            { captureStdout: true },
        );
        expect(result.code).toBe(3);
        expect(result.stdout).toBe('out');
        expect(result.stderr).toBe('err');
        expect(commandSucceeded(result)).toBe(false);
    });

    it('reports success for exit code 0', async () => {
        const result = await runCommand(NODE, ['-e', '0']);
        expect(commandSucceeded(result)).toBe(true);
    });

    it('does not capture stdout unless asked', async () => {
        const result = await runCommand(NODE, ['-e', 'process.stdout.write("out")']);
        expect(result.stdout).toBe('');
    });

    it('caps captured stderr', async () => {
        const result = await runCommand(NODE, ['-e', 'process.stderr.write("x".repeat(10000))'], {
            stderrMaxChars: 100,
        });
        expect(result.stderr.length).toBe(100);
    });

    it('keeps the tail of stderr by default and flags the truncation', async () => {
        const result = await runCommand(NODE, ['-e', 'process.stderr.write("a".repeat(500) + "THE-END")'], {
            stderrMaxChars: 50,
        });
        expect(result.stderr.length).toBe(50);
        expect(result.stderr.endsWith('THE-END')).toBe(true);
        expect(result.stderrTruncated).toBe(true);
    });

    it('keeps the head of stdout by default and can keep the tail', async () => {
        const script = 'process.stdout.write("START" + "b".repeat(500) + "FINISH")';
        const head = await runCommand(NODE, ['-e', script], { captureStdout: true, stdoutMaxChars: 20 });
        expect(head.stdout.startsWith('START')).toBe(true);
        expect(head.stdoutTruncated).toBe(true);
        const tail = await runCommand(NODE, ['-e', script], {
            captureStdout: true,
            stdoutMaxChars: 20,
            stdoutKeep: 'tail',
        });
        expect(tail.stdout.endsWith('FINISH')).toBe(true);
    });

    it('does not flag truncation when everything fits', async () => {
        const result = await runCommand(NODE, ['-e', 'process.stdout.write("ok")'], { captureStdout: true });
        expect(result.stdout).toBe('ok');
        expect(result.stdoutTruncated).toBe(false);
        expect(result.stderrTruncated).toBe(false);
    });

    it('streams every chunk to onStdout even far beyond the cap', async () => {
        const chunks: string[] = [];
        const script =
            'let i=0;const t=setInterval(()=>{process.stdout.write("line"+i+"\\n");if(++i===200){clearInterval(t)}},1)';
        const result = await runCommand(NODE, ['-e', script], {
            onStdout: (chunk) => chunks.push(chunk),
            captureStdout: true,
            stdoutMaxChars: 10,
        });
        const all = chunks.join('');
        expect(all).toContain('line0');
        expect(all).toContain('line199');
        expect(chunks.length).toBeGreaterThan(1);
        expect(result.stdout.length).toBe(10);
    });

    it('streams stdout without capturing it into the result unless asked', async () => {
        const chunks: string[] = [];
        const result = await runCommand(NODE, ['-e', 'process.stdout.write("streamed")'], {
            onStdout: (chunk) => chunks.push(chunk),
        });
        expect(chunks.join('')).toBe('streamed');
        expect(result.stdout).toBe('');
    });

    it('streams stderr as it arrives', async () => {
        const chunks: string[] = [];
        await runCommand(NODE, ['-e', 'process.stderr.write("warn")'], {
            onStderr: (chunk) => chunks.push(chunk),
        });
        expect(chunks.join('')).toBe('warn');
    });

    it('decodes a multibyte character split across chunks', async () => {
        const script =
            'process.stdout.write(Buffer.from([0xe4,0xb8]));setTimeout(()=>process.stdout.write(Buffer.from([0xad])),50)';
        const result = await runCommand(NODE, ['-e', script], { captureStdout: true });
        expect(result.stdout).toBe('中');
    });

    it('a throwing callback does not break the run', async () => {
        const result = await runCommand(NODE, ['-e', 'process.stdout.write("x");process.exit(0)'], {
            onStdout: () => {
                throw new Error('boom');
            },
        });
        expect(commandSucceeded(result)).toBe(true);
    });

    it('returns after a timeout even when a grandchild keeps the pipes open', async () => {
        if (process.platform === 'win32') {
            return;
        }
        const started = Date.now();
        const result = await runCommand('/bin/sh', ['-c', 'sleep 5 & sleep 5'], { timeoutMs: 200 });
        expect(result.timedOut).toBe(true);
        expect(Date.now() - started).toBeLessThan(3000);
    });

    it('returns after an abort even when a grandchild keeps the pipes open', async () => {
        if (process.platform === 'win32') {
            return;
        }
        const controller = new AbortController();
        const pending = runCommand('/bin/sh', ['-c', 'sleep 5 & sleep 5'], { signal: controller.signal });
        setTimeout(() => controller.abort(), 100);
        const started = Date.now();
        const result = await pending;
        expect(result.aborted).toBe(true);
        expect(Date.now() - started).toBeLessThan(3000);
    });

    it('flushes an incomplete multibyte sequence at the end instead of dropping it silently', async () => {
        const result = await runCommand(NODE, ['-e', 'process.stdout.write(Buffer.from([0x61,0xe4,0xb8]))'], {
            captureStdout: true,
        });
        expect(result.stdout.startsWith('a')).toBe(true);
        expect(result.stdout.length).toBeGreaterThan(1);
    });

    it('passes cwd to the child', async () => {
        const dir = fs.realpathSync(os.tmpdir());
        const result = await runCommand(NODE, ['-e', 'process.stdout.write(process.cwd())'], {
            captureStdout: true,
            cwd: dir,
        });
        expect(fs.realpathSync(result.stdout)).toBe(dir);
    });

    it('merges env over the parent environment without touching it', async () => {
        const result = await runCommand(NODE, ['-e', 'process.stdout.write(process.env.RC_TEST_VAR || "")'], {
            captureStdout: true,
            env: { RC_TEST_VAR: 'hello' },
        });
        expect(result.stdout).toBe('hello');
        expect(process.env.RC_TEST_VAR).toBeUndefined();
    });

    it('never rejects when the executable does not exist', async () => {
        const result = await runCommand('/nonexistent/binary', []);
        expect(result.spawnError).not.toBeNull();
        expect(commandSucceeded(result)).toBe(false);
    });

    it('keeps the event loop running while the process works', async () => {
        let ticks = 0;
        const timer = setInterval(() => {
            ticks++;
        }, 10);
        const result = await runCommand(NODE, ['-e', 'setTimeout(()=>{},400)']);
        clearInterval(timer);
        expect(commandSucceeded(result)).toBe(true);
        expect(ticks).toBeGreaterThan(10);
    });

    it('kills the process on timeout', async () => {
        const result = await runCommand(NODE, ['-e', 'setTimeout(()=>{},60000)'], { timeoutMs: 200 });
        expect(result.timedOut).toBe(true);
        expect(commandSucceeded(result)).toBe(false);
    });

    it('kills the process on abort', async () => {
        const controller = new AbortController();
        const pending = runCommand(NODE, ['-e', 'setTimeout(()=>{},60000)'], { signal: controller.signal });
        setTimeout(() => controller.abort(), 100);
        const result = await pending;
        expect(result.aborted).toBe(true);
    });

    it('returns aborted immediately when the signal is already aborted', async () => {
        const controller = new AbortController();
        controller.abort();
        const result = await runCommand(NODE, ['-e', '0'], { signal: controller.signal });
        expect(result.aborted).toBe(true);
        expect(result.code).toBeNull();
    });
});

describe('runCommand prependPath', () => {
    const dirs: string[] = [];
    const isWindows = process.platform === 'win32';
    const name = isWindows ? 'fakecmd.exe' : 'fakecmd';

    function makeBin(): string {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'run-command-path-'));
        dirs.push(dir);
        const bin = path.join(dir, name);
        if (isWindows) {
            fs.copyFileSync(process.execPath, bin);
        } else {
            fs.writeFileSync(bin, `#!/bin/sh\necho ${dir}\n`);
            fs.chmodSync(bin, 0o755);
        }
        return dir;
    }

    const whichArgs = isWindows ? ['-p', 'process.execPath'] : [];

    function ranFrom(stdout: string): string {
        const printed = stdout.trim();
        return fs.realpathSync(isWindows ? path.dirname(printed) : printed);
    }

    afterEach(() => {
        for (const dir of dirs.splice(0)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it('a prepended directory wins over the system PATH', async () => {
        const own = makeBin();
        const system = makeBin();
        const original = process.env.PATH;
        process.env.PATH = `${system}${path.delimiter}${original ?? ''}`;
        try {
            const result = await runCommand('fakecmd', whichArgs, {
                captureStdout: true,
                prependPath: [own],
            });
            expect(ranFrom(result.stdout)).toBe(fs.realpathSync(own));
        } finally {
            process.env.PATH = original;
        }
    });

    it('falls back to the system PATH when the prepended directory has no such command', async () => {
        const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'run-command-empty-'));
        dirs.push(empty);
        const system = makeBin();
        const original = process.env.PATH;
        process.env.PATH = `${system}${path.delimiter}${original ?? ''}`;
        try {
            const result = await runCommand('fakecmd', whichArgs, {
                captureStdout: true,
                prependPath: [empty],
            });
            expect(ranFrom(result.stdout)).toBe(fs.realpathSync(system));
        } finally {
            process.env.PATH = original;
        }
    });

    it('does not modify the PATH of the current process', async () => {
        const own = makeBin();
        const before = process.env.PATH;
        await runCommand('fakecmd', whichArgs, { prependPath: [own] });
        expect(process.env.PATH).toBe(before);
    });

    it('an env PATH override is merged case-insensitively on Windows and applied as given elsewhere', async () => {
        const own = makeBin();
        const result = await runCommand(
            NODE,
            [
                '-e',
                'process.stdout.write(String(Object.keys(process.env).filter((k) => k.toUpperCase() === "PATH").length))',
            ],
            { captureStdout: true, env: { PATH: own }, prependPath: [own] },
        );
        expect(result.stdout).toBe('1');
    });
});
