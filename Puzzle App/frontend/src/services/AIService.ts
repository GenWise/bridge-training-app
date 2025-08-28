import type { Puzzle } from '../types/Puzzle';

export interface AIScoreResult {
  score: number; // 0-10
  feedback: string;
  strengths: string[];
  improvements: string[];
}

class AIService {
  private apiKey: string | null = null;
  private baseURL = '/api/anthropic/v1/messages';

  constructor() {
    // Use Vite's environment variable handling
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || 
                  import.meta.env.REACT_APP_ANTHROPIC_API_KEY || 
                  null;
    
    // Log API key status for debugging
    if (this.apiKey) {
      console.log('✓ Claude API key found, will use real Claude API');
    } else {
      console.log('ℹ No Claude API key found, will use mock scoring');
      console.log('To enable real Claude API, set REACT_APP_ANTHROPIC_API_KEY environment variable');
    }
  }

  private async callClaude(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    console.log('🔑 API Key (first 20 chars):', this.apiKey.substring(0, 20) + '...');
    console.log('🌐 Request URL:', this.baseURL);

    const requestBody = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };

    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.log('❌ Error response body:', errorBody);
      throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    console.log('✅ Response data:', data);
    return data.content[0].text;
  }

  async scoreReasoningAgainstSolution(
    userReasoning: string,
    puzzle: Puzzle
  ): Promise<AIScoreResult> {
    console.log('🧠 Attempting real Claude API scoring...');
    
    const prompt = `
You are a STRICT bridge instructor grading a student's analysis against the EXACT expert solution.

PUZZLE: ${puzzle.final_contract} - Lead: ${puzzle.opening_lead}

EXPERT SOLUTION (CORRECT ANSWER):
"${puzzle.solution_line}"

KEY INSIGHT (WHAT STUDENT SHOULD IDENTIFY):
"${puzzle.key_insight}"

STUDENT'S ANSWER:
"${userReasoning}"

GRADING INSTRUCTIONS:
- COMPARE the student's line of play DIRECTLY to the expert solution
- If student suggests OPPOSITE of expert solution = LOW score (0-3)
- If student misses KEY INSIGHT entirely = score 0-4
- If student identifies some correct elements = score 5-7  
- If student matches expert reasoning = score 8-10
- Do NOT give generic bridge advice - GRADE THIS SPECIFIC SOLUTION

SCORING SCALE:
0-2: Wrong line of play, opposite of solution
3-4: Major errors, missed key concept
5-6: Some correct ideas but wrong execution
7-8: Good analysis with minor gaps
9-10: Excellent, matches expert reasoning

Return ONLY this JSON format:
{
  "score": X,
  "feedback": "Direct comparison of student answer vs expert solution in 1-2 sentences",
  "strengths": ["Specific things they got right from the solution"],
  "improvements": ["What they missed from the expert solution"]
}
    `;

    try {
      const response = await this.callClaude(prompt);
      console.log('✓ Claude API response received');
      
      // Try to parse JSON response
      const cleanedResponse = response.trim();
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✓ Successfully parsed Claude AI scoring result');
        return result;
      }
      
      console.log('⚠ Could not parse JSON from Claude response, using fallback');
      // Fallback if JSON parsing fails
      return {
        score: 5,
        feedback: "Unable to process analysis at this time.",
        strengths: [],
        improvements: ["Try again later"]
      };
      
    } catch (error) {
      console.error('❌ Claude API error:', error);
      throw error; // Re-throw to trigger fallback in context
    }
  }

  // Mock scoring for development/testing
  async mockScoreReasoning(
    userReasoning: string
  ): Promise<AIScoreResult> {
    console.log('🎭 Using mock AI scoring (Claude API not available)');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple mock scoring based on reasoning length and keywords
    let score = 5;
    const reasoning = userReasoning.toLowerCase();
    
    // Keyword-based scoring
    const goodWords = ['finesse', 'safety', 'entry', 'trump', 'lead', 'defense', 'squeeze'];
    const wordMatches = goodWords.filter(word => reasoning.includes(word)).length;
    score += Math.min(wordMatches, 3);
    
    // Length bonus (reasonable analysis)
    if (userReasoning.length > 50) score += 1;
    if (userReasoning.length > 100) score += 1;
    
    score = Math.min(score, 10);
    
    const feedbacks = [
      "Good analysis! Consider the safety play option when entries are limited.",
      "Nice thinking on the finesse. Don't forget to count your tricks first.",
      "Solid approach. Think about what happens if the defense switches suits.",
      "Well reasoned! Remember to consider the opponents' likely holdings.",
      "Great start. Try to think one step ahead of the defense."
    ];
    
    return {
      score,
      feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
      strengths: score >= 7 ? ["Good strategic thinking", "Identified key technique"] : ["Shows understanding of basic concepts"],
      improvements: score < 7 ? ["Consider safety plays", "Think about entry management"] : ["Minor tactical refinements"]
    };
  }
}

export const aiService = new AIService();