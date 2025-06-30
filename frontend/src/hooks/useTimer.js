import { useEffect, useRef, useState } from "react"

export const useTimer = () => {
    const [timer, setTimer] = useState(0)
    const intervalId = useRef(null)


    const increaseTimer = () => {
        setTimer((pre) => pre + 1)
    }

    const startTimer = () => {
        intervalId.current = setInterval(increaseTimer, 1000)
    }

    const pauseTimer = () => {
        clearInterval(intervalId.current)
    }

    const resetTimer = () => {
        // clearInterval(intervalId.current)
        setTimer(0)
    }

    useEffect(() => {
        return () => clearInterval(intervalId.current); // ✅ Cleanup interval on unmount
    }, []);


    return {
        timer,
        startTimer,
        pauseTimer,
        resetTimer
    }
}