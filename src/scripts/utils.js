import {format as d3Format} from "d3-format";
import {timeDay as d3TimeDay} from "d3-time";
import {timeDays as d3TimeDays} from "d3-time";
import {timeMonth as d3TimeMonth} from "d3-time";

let utils = {
    getReadingTime(string) {
        let WORDS_PER_MINUTE = 260;
        let result = {};
        let regex = /\w+/g;

        result.wordCount = (string || "").match(regex).length;
        result.readingTime = Math.ceil(result.wordCount / WORDS_PER_MINUTE);

        return result;
    },
    isInViewport(elem) {
        var distance = elem.getBoundingClientRect();
        return (
            distance.top >= 0 &&
            distance.left >= 0 &&
            distance.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            distance.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    animationFrame: callback => {
        let currentCallback = null;
        return () => {
            window.cancelAnimationFrame(currentCallback);
            currentCallback = window.requestAnimationFrame(callback);
        };
    },
    debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    },

    filters: {
        getReadingTime: string => utils.getReadingTime(string),
    },
};

export default utils;
