"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import {
  CheckCircle,
  WarningTriangle,
  XmarkCircle,
  InfoCircle,
  WarningCircle,
} from "iconoir-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = props.variant || "default"

        return (
          <Toast key={id} {...props}>
            <div className="flex gap-3 items-start">
              {variant === "success" && (
                <CheckCircle className="h-5 w-5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              {variant === "warning" && (
                <WarningTriangle className="h-5 w-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              )}
              {variant === "destructive" && (
                <XmarkCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
              )}
              {variant === "info" && (
                <InfoCircle className="h-5 w-5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              )}
              {variant === "default" && (
                <WarningCircle className="h-5 w-5 mt-0.5 shrink-0 text-slate-500 opacity-0 w-0 h-0 hidden" />
              )}

              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

