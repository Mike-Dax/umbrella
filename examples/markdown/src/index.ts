import { timedResult } from "@thi.ng/bench";
import { stream, Stream } from "@thi.ng/rstream/stream";
import { updateDOM } from "@thi.ng/transducers-hdom";
import { iterator } from "@thi.ng/transducers/iterator";
import { map } from "@thi.ng/transducers/xform/map";
import { parseMD } from "./parser";

// ignore error, resolved by parcel
import readme from "../README.md";

// custom tag factories (passed to parser)
// uses Tachyons CSS classes for styling
const CUSTOM_TAGS = {
    pre: (ctx, body) => ["pre.bg-washed-yellow.pa3.f7", { lang: ctx.lang }, ["code", body]],
    a: (ctx) => ["a.link.dark-blue.hover-white.hover-bg-dark-blue.b", { href: ctx.href }, ctx.title],
    strike: (_, body) => ["del.bg-washed-red", body],
    code: (_, body) => ["code.bg-light-gray.pa1.f7", body],
};

// UI root component
const app =
    (input: Stream<string>) =>
        ({ src, parsed: [hiccup, time] }) =>
            ["div.flex.vh-100.sans-serif.flex-column.flex-row-l",
                ["div.w-100.h-50.w-50-l.h-100-l",
                    ["textarea.w-100.vh-50.vh-100-l.bg-washed-blue.pa3.f7.code",
                        {
                            value: src,
                            oninput: (e) => input.next(e.target.value)
                        }
                    ]],
                ["div.w-100.h-50.w-50-l.vh-100-l.overflow-y-scroll.pa3.lh-copy",
                    ["div.pa2.bg-yellow.purple.f7", `Parsed in ${time}ms`],
                    ...hiccup]
            ];

// markdown input stream
const src = stream<string>();

// stream transformer & UI update
src.transform(
    map((src) => ({ src, parsed: timedResult(() => [...iterator(parseMD(CUSTOM_TAGS), src)]) })),
    map(app(src)),
    updateDOM()
);

// seed temp input
src.next(`# Loading readme...`);

// load markdown & seed input
fetch(readme)
    .then((res) => res.text())
    .then((txt) => src.next(txt))
    .catch((e) => src.next(`# Error loading file: ${e}`));

// HMR handling
if (process.env.NODE_ENV !== "production") {
    const hot = (<any>module).hot;
    hot && hot.dispose(() => src.done());
}
