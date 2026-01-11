"use client";

import Image, { ImageProps } from "next/image";
import { useState, memo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  showSkeleton?: boolean;
}

// Base64 encoded tiny blur placeholder (1x1 pixel)
const BLUR_PLACEHOLDER = 
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBQEEAPwCwAB//2Q==";

// Gray placeholder for errors
const ERROR_PLACEHOLDER = "/placeholder-image.svg";

function OptimizedImageComponent({
  src,
  alt,
  className,
  fallbackSrc = ERROR_PLACEHOLDER,
  aspectRatio = "auto",
  showSkeleton = true,
  priority = false,
  sizes,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  };

  // Default responsive sizes if not provided
  const defaultSizes = sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-100",
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Loading skeleton */}
      {showSkeleton && isLoading && !hasError && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]" />
      )}

      <Image
        src={hasError ? fallbackSrc : src}
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        priority={priority}
        sizes={defaultSizes}
        quality={85}
        {...props}
      />
    </div>
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);

/**
 * Avatar image with circular crop and fallback
 */
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallbackInitials?: string;
  className?: string;
}

function AvatarImageComponent({
  src,
  alt,
  size = "md",
  fallbackInitials,
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const sizePx = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  // Get initials from alt text
  const initials = fallbackInitials || alt
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium",
          sizeClasses[size],
          className
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-slate-100",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
        sizes={`${sizePx[size]}px`}
      />
    </div>
  );
}

export const AvatarImage = memo(AvatarImageComponent);

/**
 * Thumbnail image with aspect ratio preservation
 */
interface ThumbnailProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}

function ThumbnailComponent({
  src,
  alt,
  width = 200,
  height = 150,
  className,
  onClick,
}: ThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity",
        className
      )}
      style={{ width, height }}
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        sizes={`${width}px`}
      />
    </div>
  );
}

export const Thumbnail = memo(ThumbnailComponent);
