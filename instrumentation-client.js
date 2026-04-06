// This file runs before any React/Next.js code on the client.
// It intercepts the "Router action dispatched before initialization" error
// which is a known race condition in Next.js dev mode when the sandbox
// reloads environment variables and sends an HMR signal before the
// App Router has mounted on the client.

if (typeof window !== "undefined") {
  const ROUTER_ERR = "Router action dispatched before initialization";

  // 1. Capture-phase error listener — catches errors thrown inside event
  //    listener callbacks (which window.onerror does NOT catch).
  window.addEventListener("error", function (e) {
    if (e.message && e.message.includes(ROUTER_ERR)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      setTimeout(() => window.location.reload(), 300);
    }
  }, true /* capture */);

  // 2. Unhandled promise rejection fallback
  window.addEventListener("unhandledrejection", function (e) {
    const msg = e.reason?.message ?? String(e.reason ?? "");
    if (msg.includes(ROUTER_ERR)) {
      e.preventDefault();
      setTimeout(() => window.location.reload(), 300);
    }
  });

  // 3. Legacy onerror as last resort
  const _prev = window.onerror;
  window.onerror = function (msg, src, line, col, err) {
    if (typeof msg === "string" && msg.includes(ROUTER_ERR)) {
      setTimeout(() => window.location.reload(), 300);
      return true;
    }
    return _prev ? _prev.call(this, msg, src, line, col, err) : false;
  };
}
