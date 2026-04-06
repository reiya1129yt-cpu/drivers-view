// This file runs before any React/Next.js code on the client.
// It intercepts the "Router action dispatched before initialization" error
// which is a known race condition in Next.js dev mode when the sandbox
// reloads environment variables and sends an HMR signal before the
// App Router has mounted on the client.

if (typeof window !== "undefined") {
  // Intercept synchronous throws
  const _origOnError = window.onerror;
  window.onerror = function (msg, src, line, col, err) {
    if (
      typeof msg === "string" &&
      msg.includes("Router action dispatched before initialization")
    ) {
      setTimeout(() => window.location.reload(), 500);
      return true; // suppress the error overlay
    }
    return _origOnError ? _origOnError.call(this, msg, src, line, col, err) : false;
  };

  // Intercept promise rejections
  window.addEventListener("unhandledrejection", function (e) {
    const msg = e.reason?.message ?? String(e.reason ?? "");
    if (msg.includes("Router action dispatched before initialization")) {
      e.preventDefault();
      setTimeout(() => window.location.reload(), 500);
    }
  });
}
