# CLOUD.VERSE - AWS Certification Exam Trainer

A free, donation-powered AWS certification exam practice platform. Master AWS certifications with practice exams, flashcards, and domain-specific training.

## Features

- 📚 **Multiple Certifications**: SAA-C03, CLF-C02, AIF-C01
- 🎯 **Practice Modes**: Quick quiz, full exam, by domains
- 📊 **Performance Tracking**: Real-time score calculation and domain analysis
- 💾 **Flashcard Bank**: Study with interactive flashcards
- 🌙 **Dark Mode**: Built-in dark/light theme support
- 📱 **Responsive**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Build**: Vite
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── screens/          # Page screens (Landing, Quiz, Results)
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API and data services
│   ├── store/            # State management
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── data/                 # Question databases
├── scripts/              # Data import/management scripts
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run analyzeQuestions` - Analyze question database
- `npm run importQuestions` - Import question data
- `npm run import-custom` - Import custom questions
- `npm run import-aif` - Import AIF questions
- `npm run verify:*` - Verify certification data

## Navigation Pattern

- **Back Button**: Returns to exam dashboard/panel
- **Exit Button**: Returns to landing page
- This pattern is consistent across all quiz modes

## Database Schema

Questions are stored in Supabase with the following structure:

- `id`: Unique identifier
- `certification_id`: SAA-C03, CLF-C02, or AIF-C01
- `domain`: Knowledge domain
- `question_text`: Question stem
- `option_a-e`: Answer options
- `correct_answers`: Array of correct options
- `explanation_detailed`: Detailed explanation

## License

© 2025 CLOUD.VERSE - Created by Fabrício Felix

This platform is not affiliated with Amazon Web Services.

## Support

If you find this platform helpful, consider supporting the project:

- [Ko-fi](https://ko-fi.com/fabriciocosta) - Buy me a coffee
- [LinkedIn](https://www.linkedin.com/in/fabriciocosta85/) - Connect with me
