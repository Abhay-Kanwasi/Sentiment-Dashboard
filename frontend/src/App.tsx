import { createGlobalStyle, ThemeProvider } from 'styled-components';
import ModernDashboard from './components/ModernDashboard';

// Define global styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  body {
    background-color: #f7f9fc;
    color: #1a2027;
    line-height: 1.6;
  }
`;

// Theme configuration
const theme = {
  colors: {
    primary: '#3a86ff',
    secondary: '#8338ec',
    success: '#06d6a0',
    danger: '#ef476f',
    warning: '#ffd166',
    dark: '#1a2027',
    light: '#f7f9fc',
    gray: '#8d99ae',
    grayLight: '#edf2fb',
    white: '#ffffff',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
    lg: '0 10px 25px rgba(0,0,0,0.1), 0 2px 10px rgba(0,0,0,0.04)',
  },
  transitions: {
    default: 'all 0.3s ease',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
  }
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ModernDashboard />
    </ThemeProvider>
  );
}

export default App;