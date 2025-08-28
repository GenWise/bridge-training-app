# Bridge Training App - Current Issues & Handoff

## 🐛 Known Issues to Fix

### 1. Submit Score Button Not Working
- **Problem**: "Submit for Score" button doesn't trigger AI scoring
- **Likely cause**: Event handler not properly connected or async function failing silently
- **Location**: `QuizView.tsx` handleSubmit function
- **Check**: Browser console for errors, quiz context state updates

### 2. Contract Not Showing in BBO HandViewer
- **Problem**: Contract info not appearing in BBO iframe despite URL parameter changes
- **Likely cause**: BBO API parameter format incorrect or unsupported
- **Location**: `bboConverter.ts` createBBOViewerURL function
- **Check**: Actual BBO URL being generated, test URL manually in browser

### 3. API Key Integration
- **Status**: API key is set in `.env.local` but needs verification
- **Check**: Console logs should show "Claude API key found" message
- **Fallback**: Mock scoring should work regardless

## 🎯 Working Features
- ✅ Session builder with puzzle generation
- ✅ Navigation between screens (SessionBuilder → QuizView)
- ✅ BBO HandViewer iframe loading (showing hands)
- ✅ Mobile-first phone frame design
- ✅ Quiz state management structure
- ✅ Responsive layout and scrolling

## 🔧 Quick Debugging Steps
1. **Check browser console** for JavaScript errors during "Submit for Score"
2. **Inspect BBO URL** being generated - log it in console
3. **Test mock scoring** by temporarily disabling API key
4. **Verify event handlers** are properly bound in QuizView

## 📋 Architecture Status
- **React + TypeScript** setup complete
- **Quiz Context** managing state properly
- **BBO Integration** partially working (hands display, contract missing)
- **AI Service** structure ready (needs debugging)
- **Mobile design** working perfectly

## 📁 Key Files
- `QuizView.tsx` - Submit button issue
- `bboConverter.ts` - Contract display issue  
- `AIService.ts` - Claude API integration
- `QuizContext.tsx` - State management
- `.env.local` - API key configured

## 🚀 Next Session Prompt

```
I'm working on a Bridge Training App (React/TypeScript) with a mobile-first design. 

Current state: The quiz flow works (session builder → quiz view → solution view) but I have two critical issues:

1. "Submit for Score" button in quiz view doesn't work - should trigger AI scoring with Claude API
2. Contract info not displaying in BBO HandViewer iframe despite URL parameters

Please review the current-issues-and-handoff.md file and CLAUDE.md for context, then:
- Debug the Submit Score functionality (check QuizView.tsx and QuizContext.tsx)  
- Fix BBO contract display (check bboConverter.ts URL generation)
- Test with the Claude API key already configured in .env.local

The app should show AI scoring results after user submits reasoning, then allow viewing full solution with all bridge hands.
```