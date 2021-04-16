export const timeFormatter = input => {
    if (input < 60) {
        return `${input} mins`
    } else if (input === 60) {
        return `${Math.floor(input/60)} hour`
    } else if (input === 120) {
        return `${Math.floor(input/60)} hours`
    } else {
        return `${Math.floor(input/60)} hour ${input - 60} mins`
    }
}