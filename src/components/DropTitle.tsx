import { Fragment } from "react";

/** Headline whose words drop in from above one after another */
export default function DropTitle({ text, delay = 0.15, step = 0.12 }: { text: string; delay?: number; step?: number }) {
  return text.split(/\s+/).map((w, i, all) => (
    <Fragment key={i}>
      <span className="drop-word" style={{ animationDelay: `${delay + i * step}s` }}>
        {w}
      </span>
      {i < all.length - 1 ? " " : null}
    </Fragment>
  ));
}
