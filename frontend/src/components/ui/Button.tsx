import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
    {
        variants: {
            variant: {
                default: "bg-richred-700 text-white hover:bg-richred-800",
                destructive: "bg-red-500 text-white hover:bg-red-600",
                outline: "border border-slate-200 hover:bg-slate-100 hover:text-slate-900",
                secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
                ghost: "hover:bg-slate-100 hover:text-slate-900",
                link: "underline-offset-4 hover:underline text-richred-700",
                dark: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20",
                primary: "bg-richred-700 text-white hover:bg-richred-800 shadow-lg shadow-richred-700/20",
            },
            size: {
                default: "h-10 py-2 px-4",
                sm: "h-9 px-3 rounded-lg",
                lg: "h-11 px-8 rounded-xl",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
