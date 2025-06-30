import { useState } from "react"

export const useCounter = (
    initial = 0,
    step = 1
) => {
    const [counter, setCounter] = useState(initial)

    const increament = () => {
        setCounter((prev) => prev + step)
    }

    const decrement = () => {
        setCounter((prev) => prev - step)
    }

    return {
        counter,
        increament,
        decrement
    }
}