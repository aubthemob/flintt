import { DefaultTheme } from 'react-native-paper';

const theme = {
    ...DefaultTheme,
    roundness: 25,
    colors: {
        ...DefaultTheme.colors,
        primary: '#28C4D6',
        accent: '#FF7738',
        background: '#FFF',
        text: '#707070',
        disabled: '#D9D9D9'
    },
};

export default theme