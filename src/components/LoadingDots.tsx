
export function LoadingDots() {
  return (
    <div className="flex space-x-1 loading-dots">
      <div
        className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-dot"
        style={{ "--i": "0" } as React.CSSProperties}
      />
      <div
        className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-dot"
        style={{ "--i": "1" } as React.CSSProperties}
      />
      <div
        className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-dot"
        style={{ "--i": "2" } as React.CSSProperties}
      />
    </div>
  );
}
