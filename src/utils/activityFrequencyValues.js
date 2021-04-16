export const frequencyItems = [
    {
        key: '1',
        title: 'Mondays',
        selected: true
    },
    {
        key: '2',
        title: 'Tuesdays',
        selected: true
    },
    {
        key: '3',
        title: 'Wednesdays',
        selected: true
    },
    {
        key: '4',
        title: 'Thursdays',
        selected: true
    },
    {
        key: '5',
        title: 'Fridays',
        selected: true
    },
    {
        key: '6',
        title: 'Saturdays',
        selected: true
    },
    {
        key: '0',
        title: 'Sundays',
        selected: true
    },
]

export const reduceFrequencyValue = (arr) => {
    if (typeof arr[0] === 'object') {
        if (arr.length === 0) {
            return []
        } else {
            const keys = arr.filter(i => i.selected).map(i => i.key)
            return keys
        } 

    } else {
        return arr
    }
}