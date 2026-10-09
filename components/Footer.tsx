export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-1 p-4 text-xs text-muted sm:px-8">
        <p>
          Educational demo — not an official PAGASA or Marikina City warning. In
          an emergency, follow official advisories.
        </p>
        <p>
          Developed by{" "}
          <a
            href="https://github.com/devcedrick"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2"
          >
            Ken Cedrick A. Jimeno
          </a>{" "}
          · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
