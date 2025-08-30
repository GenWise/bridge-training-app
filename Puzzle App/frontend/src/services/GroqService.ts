import Groq from 'groq-sdk';
import type { Puzzle } from '../types/Puzzle';
import type { AIScoreResult } from './AIService';

class GroqService {
  private groq: Groq | null = null;
  private apiKey: string | null = null;

  constructor() {
    // Use Vite's environment variable handling
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || null;
    
    if (this.apiKey) {
      this.groq = new Groq({ 
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true 
      });
      console.log('✓ Groq API key found, will use Llama-3.3-70b for scoring');
    } else {
      console.log('ℹ No Groq API key found');
      console.log('To enable Groq AI, set VITE_GROQ_API_KEY environment variable');
    }
  }

  async scoreReasoningAgainstSolution(
    userReasoning: string,
    puzzle: Puzzle
  ): Promise<AIScoreResult> {
    if (!this.groq) {
      throw new Error('Groq API key not configured');
    }

    console.log('🧠 Using Groq Llama-3.3-70b for AI scoring...');

    const prompt = `You are an expert bridge instructor evaluating a student's analysis against the EXACT expert solution.

BRIDGE PROBLEM:
- Contract: ${puzzle.final_contract}  
- Opening Lead: ${puzzle.opening_lead}
- Difficulty: ${puzzle.difficulty}
- Main Technique: ${puzzle.main_technique}

EXPERT SOLUTION (THE CORRECT ANSWER):
"${puzzle.solution_line}"

KEY INSIGHT (WHAT STUDENT MUST IDENTIFY):
"${puzzle.key_insight}"

STUDENT'S ANALYSIS:
"${userReasoning}"

GRADING CRITERIA:
1. Does the student's line of play match the expert solution?
2. Did they identify the key insight or main technique?
3. Are their tactics sound for this specific deal?

SCORING SCALE:
- 0-2: Completely wrong approach, opposite of solution
- 3-4: Major errors, missed the key concept entirely  
- 5-6: Some correct ideas but significant gaps or wrong execution
- 7-8: Good analysis, mostly aligns with expert solution
- 9-10: Excellent, matches expert reasoning and identifies key insight

Respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-10>,
  "feedback": "<1-2 sentence comparison of student vs expert solution>",
  "strengths": ["<specific correct points from their analysis>"],
  "improvements": ["<specific gaps compared to expert solution>"]
}`;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from Groq API');
      }

      console.log('✓ Groq API response received');

      // Parse JSON response
      const cleanedResponse = response.trim();
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✓ Successfully parsed Groq AI scoring result');
        
        // Validate the result structure
        if (typeof result.score === 'number' && 
            typeof result.feedback === 'string' &&
            Array.isArray(result.strengths) &&
            Array.isArray(result.improvements)) {
          return {
            score: Math.max(0, Math.min(10, result.score)), // Clamp between 0-10
            feedback: result.feedback,
            strengths: result.strengths,
            improvements: result.improvements
          };
        }
      }
      
      console.log('⚠ Could not parse valid JSON from Groq response, using fallback');
      return {
        score: 5,
        feedback: "Unable to process analysis at this time.",
        strengths: [],
        improvements: ["Try submitting again"]
      };
      
    } catch (error) {
      console.error('❌ Groq API error:', error);
      throw error;
    }
  }
}

export const groqService = new GroqService();