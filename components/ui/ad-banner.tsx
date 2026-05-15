"use client";

interface AdBannerProps {
  placement?: "top" | "bottom" | "inline";
  className?: string;
}

export default function AdBanner({ placement = "inline", className = "" }: AdBannerProps) {
  // This is a placeholder for actual ad integration (e.g., Google AdSense, AdMob)
  // In production, replace with actual ad SDK
  
  const baseStyles = "bg-secondary/50 border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm";
  
  const heightStyles = {
    top: "h-12",
    bottom: "h-12",
    inline: "h-20",
  };

  return (
    <div className={`${baseStyles} ${heightStyles[placement]} ${className}`}>
      <span>広告スペース</span>
    </div>
  );
}
