// utils/timeUtils.js

/**
 * Checks if two time intervals overlap.
 * @param {Date} startA - Start time of first interval.
 * @param {Date} endA - End time of first interval.
 * @param {Date} startB - Start time of second interval.
 * @param {Date} endB - End time of second interval.
 * @returns {boolean} - True if overlaps, else false.
 */
export const doIntervalsOverlap = (startA, endA, startB, endB) => {
    return startA < endB && startB < endA;
};
  