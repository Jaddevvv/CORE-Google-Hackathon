# CORE Demo Workflow

## Overview
Interactive demo flow that guides users through brand analysis setup with AI-powered question generation.

## Workflow Steps

### Step 1: Brand Information
- User enters **Brand Name**
- User describes **Activity & Keywords** (sector, main activities, key topics)
- Clean, minimal form with purple accents matching landing page design

### Step 2: Competitors
- **Option A**: Manually add up to 3 competitors
- **Option B**: Click "Generate with AI" to auto-suggest competitors based on brand activity
- At least 1 competitor required to proceed
- Visual feedback for AI-generated suggestions

### Step 3: Question Generation
- Automatic generation of **30 relevant questions** using DeepSeek Chat API
- Questions are sector-specific but **do not mention brand names**
- Goal: Test if brand appears in LLM responses when asked about the sector/activity
- Real-time progress indicator during generation
- Questions displayed in scrollable, numbered list

## Technical Details

### API Integration
- **Model**: DeepSeek Chat (`deepseek-chat`)
- **Endpoint**: `https://api.deepseek.com/v1/chat/completions`
- **Authentication**: Bearer token from `.env` file (`VITE_DEEPSEEK_API_KEY`)

### Prompt Engineering
The system prompt instructs the AI to:
1. Generate questions about the **sector** without mentioning specific brands
2. Create diverse question types (how-to, what-is, best-way, comparisons)
3. Range from beginner to advanced topics
4. Output exactly 30 numbered questions

### Design System
- **Typography**: Light font weights (`font-light`) for body, medium for emphasis
- **Colors**: Purple-600 primary, gray scale for text
- **Components**: Rounded cards (rounded-3xl), purple accents, smooth transitions
- **Layout**: Max-width containers, responsive grid, sticky progress bar

## File Structure
```
src/
├── components/
│   └── demo/
│       ├── BrandStep.jsx          # Step 1: Brand info form
│       ├── CompetitorsStep.jsx    # Step 2: Competitor selection
│       ├── QuestionsStep.jsx      # Step 3: AI question generation
│       └── DemoWorkflow.jsx       # Main orchestrator component
├── pages/
│   └── DemoInteractivePage.jsx    # Route wrapper
└── App.jsx                        # Updated with /demo/interactive route
```

## Routes
- `/demo` - Demo overview page
- `/demo/interactive` - Interactive workflow (new)

## Environment Variables
Required in `.env`:
```
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

## State Management
Uses React `useState` to maintain demo data across steps:
```javascript
{
  brandName: string,
  keywords: string,
  competitors: string[],
  questions: string[]
}
```

## Next Steps (Future)
After question generation is complete:
1. Query multiple LLMs with generated questions
2. Analyze brand mentions in responses
3. Compare visibility vs competitors
4. Generate attribution report
