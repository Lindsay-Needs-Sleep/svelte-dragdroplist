
export function setIntervalWithMax(fn, waitTime, maxTime) {
    let timeElapsed = 0; // approximately
    let interval = setInterval(() => {
        timeElapsed += waitTime;
        let reachedMaxTime = timeElapsed >= maxTime;
        if (reachedMaxTime) clearInterval(interval);
        fn(reachedMaxTime);
    }, waitTime);
    return interval;
}
