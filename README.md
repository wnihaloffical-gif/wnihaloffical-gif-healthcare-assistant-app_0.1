# AarogyaGuard - AI + Blockchain Healthcare Assistant

A comprehensive multi-language, voice-based AI healthcare assistant with blockchain-backed secure record storage.

## Features

### Core Capabilities
- **Multi-Language Support**: Hindi, Marathi, and English
- **Voice-Based Symptom Collection**: Record and transcribe symptoms in your preferred language
- **AI-Powered Analysis**: Intelligent symptom analysis and medical triage
- **Drug-Drug Interaction (DDI) Checking**: Safe medication recommendations
- **Blockchain Integration**: Immutable, secure health records
- **Role-Based Access**: Patient, Doctor, and Admin roles

### Patient Features
- Start new consultations with voice recording
- View past consultation history
- Receive AI-powered symptom analysis
- Get safe medication suggestions with DDI warnings
- View blockchain-verified records

### Doctor Features
- Review patient consultations
- Accept/modify AI suggestions
- Add clinical notes and final diagnosis
- View DDI alerts and safety information
- Finalize and anchor consultations to blockchain

### Admin Features
- System metrics and analytics
- Consultation statistics
- Language usage distribution
- Risk level breakdown
- System health monitoring

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + custom design tokens
- **Backend**: Next.js API Routes
- **Database**: Mock implementation (easily extensible to PostgreSQL/Supabase)
- **AI/ML**: Integrated AI SDK for LLM calls (mocked)
- **Blockchain**: Mock blockchain layer (easily extensible to Ethereum)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/aayarogyaguard.git
cd aayarogyaguard
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Test Accounts

**Patient**
- Email: patient@example.com
- Password: password123

**Doctor**
- Email: doctor@example.com
- Password: password123

**Admin**
- Email: admin@example.com
- Password: password123

## Project Structure

\`\`\`
/app
  /patient          - Patient dashboard and consultation flows
  /doctor           - Doctor dashboard and review interface
  /admin            - Admin analytics dashboard
  /auth             - Authentication pages
  /api              - API endpoints
    /auth           - Authentication endpoints
    /consultation   - Consultation analysis endpoint
  /globals.css      - Global styles and design tokens
  /layout.tsx       - Root layout

/components
  /patient          - Patient-specific components
  /doctor           - Doctor-specific components
  /consultation     - Shared consultation components

/lib
  /ai               - AI analysis engines
    /symptom-extractor.ts
    /triage-engine.ts
    /ddi-checker.ts
  /blockchain       - Blockchain integration
    /client.ts
  /types.ts         - TypeScript type definitions
  /db-seed.ts       - Seed data

/middleware.ts     - Auth middleware
\`\`\`

## Key Features Implementation

### Voice Recording & Transcription
- Browser-based audio recording with start/stop controls
- Mock transcription service (integrate with Google Speech-to-Text, Azure Speech)
- Support for multiple languages
- Editable transcription text

### Symptom Analysis
- Natural language symptom extraction
- Probable condition identification (1-3 conditions)
- Risk level classification (low/medium/high)
- Red flag detection for emergencies

### Medication Recommendations
- Safe drug suggestions per condition
- Drug-Drug Interaction (DDI) checking
- High-risk combination filtering
- Alternative medicine suggestions when interactions detected

### Blockchain Integration
- Mock blockchain layer for consultation anchoring
- Hash-based record storage
- Transaction ID generation
- Immutable timestamp recording
- Easy to extend to real blockchain (Ethereum, Polygon, etc.)

## Integration Points

The app includes clear comments for integrating:

1. **Real LLM**: Replace mock `runTriage()` with actual LLM API calls (OpenAI, Claude, Llama)
2. **Speech-to-Text**: Integrate Google Cloud Speech, Azure Speech-to-Text, or Deepgram
3. **Real Blockchain**: Connect to Ethereum, Polygon, or other blockchain networks
4. **Database**: Replace mock data with PostgreSQL/Supabase with Prisma ORM
5. **Video Consultations**: Add WebRTC for doctor-patient video calls

## Security Features

- HTTPS/TLS support (configured in production)
- Role-based access control (RBAC)
- Secure token-based authentication
- Input validation and sanitization
- Blockchain-verified audit trail
- Privacy-first design with data masking

## Compliance & Disclaimers

⚠️ **Important**: This application is designed for **educational and assistive purposes only**. It does NOT:
- Provide medical diagnosis or prescription
- Replace professional medical advice
- Guarantee accuracy of AI analysis

All users must:
- Consult licensed doctors for medical decisions
- Not rely solely on AI suggestions for treatment
- Seek emergency care immediately for critical symptoms

## Performance Optimizations

- React Server Components where applicable
- Client-side data caching with SWR
- Optimized images with Next.js Image component
- CSS-in-JS with Tailwind for minimal bundle
- Mock data for instant loading during development

## Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader optimization
- Large touch targets (44x44px minimum)
- High contrast text

## Future Roadmap

- [ ] Real database integration (PostgreSQL/Supabase)
- [ ] Real LLM integration (GPT-4, Claude)
- [ ] Real speech-to-text service
- [ ] Video consultation capability
- [ ] Real blockchain integration
- [ ] Mobile app (React Native)
- [ ] Advanced ML models for diagnosis
- [ ] Prescription printing
- [ ] Insurance integration
- [ ] Multi-hospital network support

## Contributing

Contributions are welcome! Please follow the coding standards and submit PRs.

## License

MIT License - see LICENSE file for details

## Support

For issues, bugs, or feature requests, please open an issue on GitHub.

## Disclaimer

This project is provided as-is for educational purposes. The developers and contributors are not responsible for any medical decisions made based on this application. Always consult qualified healthcare professionals.

---

Built with ❤️ for healthcare accessibility in India and beyond.
