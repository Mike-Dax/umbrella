import { peek } from "@thi.ng/arrays";
import { wordWrap } from "@thi.ng/transducers";
import { Canvas } from "./canvas";

/**
 * Writes given string at position `x`,`y`, taking the current clip rect
 * and format into account. The string MUST not include linebreaks or
 * other control chars.
 *
 * @param canvas
 * @param x
 * @param y
 * @param line
 */
export const textLine = (
    canvas: Canvas,
    x: number,
    y: number,
    line: string
) => {
    x |= 0;
    y |= 0;
    const { x1, y1, x2, y2 } = peek(canvas.clipRects);
    if (y < y1 || y >= y2 || x >= x2) return;
    let i = 0;
    if (x < x1) {
        i = x1 - x;
        x = x1;
    }
    const { buf, width } = canvas;
    const format = peek(canvas.format) << 16;
    const n = line.length;
    for (let idx = x + y * width; i < n && x < x2; i++, x++, idx++) {
        buf[idx] = line.charCodeAt(i) | format;
    }
};

/**
 * Writes multiline string at position `x`,`y` and using column `width`,
 * also taking the current clip rect and format into account. Applies
 * word wrapping.
 *
 * @param canvas
 * @param x
 * @param y
 * @param width
 * @param txt
 */
export const textColumn = (
    canvas: Canvas,
    x: number,
    y: number,
    width: number,
    txt: string
) => {
    x |= 0;
    y |= 0;
    width |= 0;
    const height = canvas.height;
    for (let line of txt.split("\n")) {
        for (let words of wordWrap(width, line.split(" "))) {
            textLine(canvas, x, y, words.join(" "));
            y++;
            if (y >= height) return y;
        }
    }
    return y;
};
