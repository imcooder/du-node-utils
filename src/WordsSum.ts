/**
 * @file XWordsCount - Incremental text word/character counter
 * @author imcooder
 */

export interface XWordsCountOptions {
    /** Ignore punctuation when counting (default: false) */
    ignorePunctuation?: boolean;
    /** Ignore whitespace characters when counting characters (default: true) */
    ignoreWhitespace?: boolean;
}

/**
 * Incremental text counter that tracks word and character counts efficiently.
 * Counts are updated on each append() call.
 *
 * Supports mixed CJK and non-CJK text:
 * - CJK characters: each character counts as 1 word
 * - Non-CJK text: space-separated tokens with at least one alphanumeric char count as 1 word
 *
 * @example
 * const counter = new XWordsCount({ ignorePunctuation: true });
 *
 * // English
 * counter.append('Hello world');
 * console.log(counter.wordCount); // 2
 *
 * // Chinese
 * counter.append('你好世界');
 * console.log(counter.wordCount); // 6 (2 English + 4 CJK)
 *
 * // Japanese (Hiragana/Katakana each char = 1 word)
 * counter.append('こんにちは');
 * console.log(counter.wordCount); // 11 (6 + 5 Hiragana)
 *
 * // Korean (each Hangul syllable = 1 word)
 * counter.append('안녕하세요');
 * console.log(counter.wordCount); // 16 (11 + 5 Hangul)
 *
 * // German (umlauts: ä, ö, ü, ß treated as alphanumeric)
 * counter.append('Straße überall');
 * console.log(counter.wordCount); // 18 (16 + 2 German words)
 *
 * // French (accented chars: é, è, ç, ê treated as alphanumeric)
 * counter.append('café résumé');
 * console.log(counter.wordCount); // 20 (18 + 2 French words)
 *
 * // Arabic
 * counter.append('مرحبا بالعالم');
 * console.log(counter.wordCount); // 22 (20 + 2 Arabic words)
 *
 * // Mixed in one append
 * counter.reset();
 * counter.append('Hello 你好 こんにちは Straße مرحبا');
 * console.log(counter.wordCount); // 10 (1 Hello + 2 你好 + 5 こんにちは + 1 Straße + 1 مرحبا)
 *
 * // --- Punctuation handling ---
 *
 * // ignorePunctuation: true (punctuation skipped)
 * const withIgnore = new XWordsCount({ ignorePunctuation: true });
 * withIgnore.append('Hello, world!');
 * console.log(withIgnore.wordCount); // 2 ("Hello" + "world", punctuation ignored)
 * console.log(withIgnore.charCount); // 10 (only letters, comma and ! excluded)
 *
 * withIgnore.reset();
 * withIgnore.append('你好。世界');
 * console.log(withIgnore.wordCount); // 4 (你好世界, 。is CJK punctuation, skipped)
 * console.log(withIgnore.charCount); // 4
 *
 * // ignorePunctuation: false (default, punctuation counted)
 * const noIgnore = new XWordsCount();
 * noIgnore.append('Hello, world!');
 * console.log(noIgnore.wordCount); // 2 ("Hello," and "world!" both contain alphanumeric)
 * console.log(noIgnore.charCount); // 12 (all non-whitespace chars including , and !)
 *
 * noIgnore.reset();
 * noIgnore.append('你好。世界');
 * console.log(noIgnore.wordCount); // 5 (你好。世界, 。in CJK range counts as 1 word)
 * console.log(noIgnore.charCount); // 5
 */
export class XWordsCount {
    private _options: Required<XWordsCountOptions>;
    private _wordCount: number = 0;
    private _charCount: number = 0;

    constructor(options?: XWordsCountOptions) {
        this._options = {
            ignorePunctuation: options?.ignorePunctuation ?? false,
            ignoreWhitespace: options?.ignoreWhitespace ?? true,
        };
    }

    /**
     * Append text and incrementally update counts
     */
    append(text: string): this {
        if (!text || !text.trim()) return this;

        this._wordCount += this._countWords(text);
        this._charCount += this._countChars(text);
        return this;
    }

    /** Current word count (CJK chars + non-CJK words) */
    get wordCount(): number {
        return this._wordCount;
    }

    /** Current character count */
    get charCount(): number {
        return this._charCount;
    }

    /** Reset all counts */
    reset(): this {
        this._wordCount = 0;
        this._charCount = 0;
        return this;
    }

    /**
     * Count words in text
     * - CJK characters: each character = 1 word
     * - Non-CJK: each space-separated token containing at least one alphanumeric = 1 word
     */
    private _countWords(text: string): number {
        let cjkCount = 0;

        // Replace CJK chars with space, count them along the way
        const chars = Array.from(text);
        const nonCjkParts: string[] = [];

        for (const char of chars) {
            if (this._isCjkChar(char)) {
                if (this._options.ignorePunctuation && this._isCjkPunctuation(char)) {
                    nonCjkParts.push(' ');
                } else {
                    cjkCount++;
                    nonCjkParts.push(' ');
                }
            } else {
                nonCjkParts.push(char);
            }
        }

        // Split by whitespace, count tokens containing at least one alphanumeric char
        const tokens = nonCjkParts.join('').split(/\s+/);
        let wordCount = 0;
        for (const token of tokens) {
            if (token.length === 0) continue;
            if (this._options.ignorePunctuation) {
                // Strip ASCII punctuation, check if anything remains
                const stripped = token.replace(/[^\w\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0900-\u097F\u0E00-\u0E7F\uFB50-\uFDFF\uFE70-\uFEFF]/g, '');
                if (stripped.length > 0) {
                    wordCount++;
                }
            } else {
                for (const c of token) {
                    if (this._isAlphanumeric(c)) {
                        wordCount++;
                        break;
                    }
                }
            }
        }

        return cjkCount + wordCount;
    }

    private _countChars(text: string): number {
        let count = 0;
        const chars = Array.from(text);
        for (const char of chars) {
            if (this._options.ignoreWhitespace && /\s/.test(char)) {
                continue;
            }
            if (this._options.ignorePunctuation && this._isPunctuation(char)) {
                continue;
            }
            count++;
        }
        return count;
    }

    private _isPunctuation(char: string): boolean {
        const code = char.codePointAt(0)!;
        // ASCII punctuation
        if (
            (code >= 0x21 && code <= 0x2F) ||
            (code >= 0x3A && code <= 0x40) ||
            (code >= 0x5B && code <= 0x60) ||
            (code >= 0x7B && code <= 0x7E)
        ) {
            return true;
        }
        return this._isCjkPunctuation(char);
    }

    private _isCjkPunctuation(char: string): boolean {
        const code = char.codePointAt(0)!;
        return (
            (code >= 0x3000 && code <= 0x303F) ||  // CJK Symbols and Punctuation
            (code >= 0xFF01 && code <= 0xFF0F) ||  // Fullwidth forms
            (code >= 0xFF1A && code <= 0xFF20) ||
            (code >= 0xFF3B && code <= 0xFF40) ||
            (code >= 0xFF5B && code <= 0xFF65) ||
            (code >= 0xFE30 && code <= 0xFE4F)     // CJK Compatibility Forms
        );
    }

    /**
     * Check if a character is CJK (Chinese/Japanese/Korean)
     */
    private _isCjkChar(char: string): boolean {
        const code = char.codePointAt(0);
        if (code === undefined) return false;
        return (
            (code >= 0x4E00 && code <= 0x9FFF) ||   // CJK Unified Ideographs
            (code >= 0x3400 && code <= 0x4DBF) ||   // CJK Unified Ideographs Extension A
            (code >= 0x20000 && code <= 0x2A6DF) || // CJK Unified Ideographs Extension B
            (code >= 0x2A700 && code <= 0x2B73F) || // CJK Unified Ideographs Extension C
            (code >= 0x2B740 && code <= 0x2B81F) || // CJK Unified Ideographs Extension D
            (code >= 0xF900 && code <= 0xFAFF) ||   // CJK Compatibility Ideographs
            (code >= 0x2F800 && code <= 0x2FA1F) || // CJK Compatibility Ideographs Supplement
            (code >= 0x3000 && code <= 0x303F) ||   // CJK Symbols and Punctuation
            (code >= 0x3040 && code <= 0x309F) ||   // Hiragana
            (code >= 0x30A0 && code <= 0x30FF) ||   // Katakana
            (code >= 0xAC00 && code <= 0xD7AF)      // Hangul Syllables
        );
    }

    /**
     * Check if a character is alphanumeric (Unicode-aware)
     * Supports: Latin, Cyrillic, Arabic, Hebrew, Devanagari, Thai, Greek
     */
    private _isAlphanumeric(char: string): boolean {
        const code = char.codePointAt(0);
        if (code === undefined) return false;
        // 0-9
        if (code >= 0x30 && code <= 0x39) return true;
        // A-Z
        if (code >= 0x41 && code <= 0x5A) return true;
        // a-z
        if (code >= 0x61 && code <= 0x7A) return true;
        // Latin Extended / Accented (À-ö, ø-ÿ, German/French chars etc.)
        if (code >= 0xC0 && code <= 0x024F) return true;
        // Cyrillic (Russian, Ukrainian, etc.)
        if (code >= 0x0400 && code <= 0x04FF) return true;
        // Arabic
        if (code >= 0x0600 && code <= 0x06FF) return true;
        // Arabic Supplement
        if (code >= 0x0750 && code <= 0x077F) return true;
        // Arabic Extended-A
        if (code >= 0x08A0 && code <= 0x08FF) return true;
        // Arabic Presentation Forms-A
        if (code >= 0xFB50 && code <= 0xFDFF) return true;
        // Arabic Presentation Forms-B
        if (code >= 0xFE70 && code <= 0xFEFF) return true;
        // Hebrew
        if (code >= 0x0590 && code <= 0x05FF) return true;
        // Devanagari (Hindi, etc.)
        if (code >= 0x0900 && code <= 0x097F) return true;
        // Thai
        if (code >= 0x0E00 && code <= 0x0E7F) return true;
        // Greek
        if (code >= 0x0370 && code <= 0x03FF) return true;
        return false;
    }
}
