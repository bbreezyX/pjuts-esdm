"use client";

import { motion, useInView, UseInViewOptions, HTMLMotionProps } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right";

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  direction?: Direction;
  fullWidth?: boolean;
  once?: boolean; // defaults to true
  amount?: UseInViewOptions["amount"];
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  fullWidth = false,
  once = true,
  amount = 0.2,
  className,
  ...props
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });
  
  const getVariants = () => {
    const distance = 40;
    
    const hidden = { 
      opacity: 0, 
      x: direction === "left" ? distance : direction === "right" ? -distance : 0, 
      y: direction === "up" ? distance : direction === "down" ? -distance : 0 
    };

    const visible = { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
      }
    };

    return { hidden, visible };
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={getVariants()}
      className={cn(fullWidth ? "w-full" : "w-auto", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  delayChildren = 0,
  staggerChildren = 0.1,
  className,
  once = true,
  amount = 0.2,
  ...props
}: HTMLMotionProps<"div"> & {
  delayChildren?: number;
  staggerChildren?: number;
  once?: boolean;
  amount?: UseInViewOptions["amount"];
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren,
            staggerChildren,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Great for individual items inside a StaggerContainer
export function FadeInItem({ 
  children, 
  className, 
  duration = 0.5, 
  delay = 0, 
  ...props 
}: HTMLMotionProps<"div"> & { duration?: number; delay?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
            transition: {
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number]
            }
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
    children,
    delay = 0,
    duration = 0.5,
    className,
    once = true,
    ...props
}: HTMLMotionProps<"div"> & { delay?: number; duration?: number; once?: boolean }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number]
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
