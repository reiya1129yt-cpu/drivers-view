"use client";

interface AdBannerProps {
  placement?: "top" | "bottom" | "inline";
  className?: string;
}

export default function AdBanner({ placement = "inline", className = "" }: AdBannerProps) {
  // This is a placeholder for actual ad integration (e.g., Google AdSense, AdMob)
  // In production, replace with actual ad SDK
  
  const baseStyles = "ad-banner rounded-lg flex items-center justify-center text-muted-foreground text-xs";
  
  const heightStyles = {
    top: "h-10",
    bottom: "h-10",
    inline: "h-16",
  };

  return (
    <div className={`${baseStyles} ${heightStyles[placement]} ${className}`}>
      <span>広告</span>
    </div>
  );
}
