type ClassValue = string | number | false | null | undefined

// Concatenate class names, filtering out falsy values. Same shape as
// MineralUI's cn() — keeps porting straightforward.
export function cn(...values: ClassValue[]): string {
    return values.filter(Boolean).join(' ')
}
