import Link from "next/link";

export function Closing() {
  return (
    <section className="closing">
      <div className="closing-inner">
        <h2 className="closing-h">
          Feedback at the
          <br />
          speed of seeing it.
        </h2>
        <Link className="btn-white lg" href="/signup">
          Get Annote
        </Link>
      </div>
    </section>
  );
}
