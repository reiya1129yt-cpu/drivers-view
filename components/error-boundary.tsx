"use client";

import React from "react";

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100dvh",
            background: "#0f1117",
            color: "#f0f2f5",
            gap: 16,
            textAlign: "center",
            padding: 24,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" style={{ width: 48, height: 48 }}>
            <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <div style={{ fontSize: 17, fontWeight: 700 }}>エラーが発生しました</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 28px",
              borderRadius: 999,
              background: "#22c55e",
              color: "#0f1117",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
            }}
          >
            再読み込み
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
