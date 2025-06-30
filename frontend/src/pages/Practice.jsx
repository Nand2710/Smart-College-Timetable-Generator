import React from 'react'
import { useCounter } from '../hooks/useCounter';
import { useTheme } from '../hooks/useTheme';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { useTimer } from '../hooks/useTimer';

function Practice() {

    const { counter, increament, decrement } = useCounter(2, 10)
    const { currentTheme, toggleTheme } = useTheme()
    const { scrollY, scrollColor } = useScrollPosition()
    const { startTimer, pauseTimer, resetTimer, timer } = useTimer()

    return (
        <main className='min-h-screen relative px-20 py-10 flex flex-col gap-10 pt-32'>
            <div className='flex flex-col gap-2'>
                <h1>Simple hook (useCounter)</h1>
                <div>Counter value : {counter}</div>
                <button onClick={increament} className='bg-black'>increament</button>
                <button onClick={decrement} className='bg-black'>decrement</button>
            </div>


            <div className='flex flex-col gap-2'>
                <h1>Intermediate level (useTheme)</h1>
                <div>CurrentTheme (state) : {currentTheme}</div>
                <div>CurrentTheme (locateStorage) : {localStorage.getItem('currentTheme')}</div>
                <button onClick={toggleTheme} className='bg-black'>Toggle theme</button>
            </div>


            <div style={{
                backgroundColor: scrollColor
            }} className={`fixed top-20 py-2 -translate-x-1/2 left-1/2 rounded-md backdrop-blur-lg px-5 flex flex-col gap-2`}>
                <h1>Intermediate level (useScrollPosition)</h1>
                <div>Scroll Y : {Math.round(scrollY)}</div>
            </div>

            <div className='flex flex-col gap-2'>
                <h1>Advanced level (useTimer)</h1>
                <div>Timer (state) : {timer}</div>
                <button onClick={startTimer} className='bg-black'>Start Timer</button>
                <button onClick={pauseTimer} className='bg-black'>Pause Timer</button>
                <button onClick={resetTimer} className='bg-black'>Reset Timer</button>
            </div>


        </main>
    )
}

export default Practice;