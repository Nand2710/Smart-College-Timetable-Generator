import { useEffect, useState } from "react"

export const useScrollPosition = () => {

    const [scrollY, setScrollY] = useState(window.scrollY)
    const [scrollColor, setScrollColor] = useState('gray')


    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
            
            if (window.scrollY < 100) {
                setScrollColor('gray')
            }
            else if (window.scrollY < 200) {
                setScrollColor('yellow')
            }
            else if (window.scrollY < 300) {
                setScrollColor('orange')
            }
            else {
                setScrollColor('red')
            }
        }
        document.addEventListener('scroll', handleScroll)

        return () => document.removeEventListener('scroll', handleScroll)
    }, [])

    return {
        scrollY,
        scrollColor
    }
}