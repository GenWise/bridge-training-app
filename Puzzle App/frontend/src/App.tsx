import { SessionBuilder } from './components/SessionBuilder';
import { QuizView } from './components/QuizView';
import { SolutionView } from './components/SolutionView';
import { QuizProvider } from './contexts/QuizContext';
import { useQuiz } from './hooks/useQuiz';

function AppContent() {
  const quiz = useQuiz();
  
  if (!quiz.state.isActive) {
    return <SessionBuilder />;
  }
  
  if (quiz.state.currentScreen === 'solution') {
    return <SolutionView />;
  }
  
  return <QuizView />;
}

function App() {
  return (
    <QuizProvider>
      <div className="App">
        <AppContent />
      </div>
    </QuizProvider>
  );
}

export default App;
