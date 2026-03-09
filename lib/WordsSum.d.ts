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
export declare class XWordsCount {
    private _options;
    private _wordCount;
    private _charCount;
    constructor(options?: XWordsCountOptions);
    /**
     * Append text and incrementally update counts
     */
    append(text: string): this;
    /** Current word count (CJK chars + non-CJK words) */
    get wordCount(): number;
    /** Current character count */
    get charCount(): number;
    /** Reset all counts */
    reset(): this;
    /**
     * Count words in text
     * - CJK characters: each character = 1 word
     * - Non-CJK: each space-separated token containing at least one alphanumeric = 1 word
     */
    private _countWords;
    private _countChars;
    private _isPunctuation;
    private _isCjkPunctuation;
    /**
     * Check if a character is CJK (Chinese/Japanese/Korean)
     */
    private _isCjkChar;
    /**
     * Check if a character is alphanumeric (Unicode-aware)
     * Supports: Latin, Cyrillic, Arabic, Hebrew, Devanagari, Thai, Greek
     */
    private _isAlphanumeric;
}
//# sourceMappingURL=WordsSum.d.ts.map