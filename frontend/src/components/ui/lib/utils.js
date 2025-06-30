// utils.js or cn.js
export function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
