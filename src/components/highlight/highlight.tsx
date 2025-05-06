import { ReactNode } from "react"

import { HighlightSize, SingleWordHighlightProps } from "./types"

export default function SingleWordHighlight ({
    size = 'lg',
    color = '#418966',
    strokeWidth = 2.5,
    width,
}: SingleWordHighlightProps) {
    
    // Default width values for different sizes
    const defaultWidths = {
        lg: 121,
        xl: 228
    };
    
    // Calculate actual width to use
    const actualWidth = width || defaultWidths[size];
    
    // Calculate height proportionally
    const defaultHeight = 11;
    const heightRatio = defaultHeight / defaultWidths[size];
    const actualHeight = Math.round(actualWidth * heightRatio);
    
    const highlights: Record<HighlightSize, ReactNode> = {
        lg: (
            <svg 
                width={actualWidth} 
                height={actualHeight} 
                viewBox={`0 0 ${defaultWidths.lg} ${defaultHeight}`} 
                preserveAspectRatio="none"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M1 5.26667L58.7925 2L55.6402 9L120 5.26667" stroke={color} strokeWidth={strokeWidth}/>
            </svg>
        ),
        xl: (
            <svg 
                width={actualWidth} 
                height={actualHeight} 
                viewBox={`0 0 ${defaultWidths.xl} ${defaultHeight}`} 
                preserveAspectRatio="none"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M1 5.5L111 2L105 9.5L227.5 5.5" stroke={color} strokeWidth={strokeWidth}/>
            </svg>
        )
    }

    return highlights[size]
}