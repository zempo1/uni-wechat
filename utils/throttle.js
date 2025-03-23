/**
 * 节流函数
 * @param {Function} fn 需要节流的函数
 * @param {number} delay 延迟时间，单位毫秒
 * @returns {Function} 节流后的函数
 */
export const throttle = (fn, delay) => {
    let timer = null;
    let lastTime = 0;

    return function (...args) {
        const now = Date.now();

        if (now - lastTime >= delay) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            fn.apply(this, args);
            lastTime = now;
        } else if (!timer) {
            timer = setTimeout(() => {
                fn.apply(this, args);
                lastTime = Date.now();
                timer = null;
            }, delay);
        }
    };
};