import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { QueryClient } from '@tanstack/react-query';



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// src/lib/queryClient.ts

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2, // Retry failed queries twice
    },
  },
});