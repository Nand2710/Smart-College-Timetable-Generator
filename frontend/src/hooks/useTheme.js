import { useEffect, useState } from "react"

export const useTheme = () => {

    const [currentTheme, setCurrentTheme] = useState('light')


    useEffect(() => {
        const persistedCurrentTheme = localStorage.getItem('currentTheme');
        if (persistedCurrentTheme) {
            setCurrentTheme(persistedCurrentTheme)
        }
        else {
            localStorage.setItem('currentTheme', 'light')
        }
    }, [])

    const toggleTheme = () => {
        if (currentTheme === "dark") {
            setCurrentTheme("light")
            localStorage.setItem('currentTheme', 'light')

        }
        else {
            setCurrentTheme('dark')
            localStorage.setItem('currentTheme', 'dark')
        }
    }

    return {
        toggleTheme,
        currentTheme
    }
}