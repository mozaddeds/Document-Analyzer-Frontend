=============================================================================
DOCUMENT ANALYZER - FRONTEND DOCUMENTATION
=============================================================================

Project Live Link : [Document Analyzer](https://document-analyzer-frontend-cyan.vercel.app/)

PROJECT OVERVIEW
----------------
A Next.js-based web application that allows users to upload PDF documents 
and receive AI-generated summaries using Google's Gemini API. Built with 
TypeScript, React Hook Form, and Tailwind CSS.

TECH STACK
----------
- Framework: Next.js 15+ (App Router)
- Language: TypeScript
- UI Library: React 18+
- Form Handling: React Hook Form
- Styling: Tailwind CSS
- HTTP Client: XMLHttpRequest (for upload progress tracking)
- Font: Google Fonts (Roboto Condensed, Geist)

FILE STRUCTURE
--------------
app/
├── layout.tsx              # Root layout with font configuration
├── page.tsx                # Home page with file upload interface
├── globals.css             # Global styles and Tailwind imports

components/
└── Input/
    └── FileInput.tsx       # Main file upload component with state management

lib/
├── types.ts                # TypeScript type definitions
├── functions.ts            # Utility functions (upload with progress)
└── utils.ts                # Helper functions (Tailwind class merging)

CORE COMPONENTS
---------------

1. FileInput Component (components/Input/FileInput.tsx)
   Purpose: Handles file selection, upload, and displays analysis results
   
   State Management:
   - uploadState: Tracks current status (idle/uploading/analyzing/success/error)
   - fileName: Stores selected file name for display
   
   Key Features:
   - Custom file input button (hidden native input)
   - Real-time upload progress tracking
   - File validation (PDF only, max 10MB)
   - Animated loading states
   - Structured summary display with cards
   - Error handling with retry capability
   
   User Flow:
   1. User clicks "Choose File" button
   2. Selects PDF file (validated client-side)
   3. Clicks "Analyze" button
   4. Sees upload progress (0-100%)
   5. Sees analyzing animation
   6. Views structured summary or error message

2. Upload State Machine (lib/types.ts)
   Type: Discriminated Union
   
   States:
   - idle: Initial state, ready for upload
   - uploading: File transfer in progress (includes progress percentage)
   - analyzing: Backend processing file (includes retry attempt tracking)
   - success: Analysis complete (includes response data)
   - error: Upload or analysis failed (includes error message and retry flag)
   
   Why Discriminated Union?
   - Type safety: Each state has specific properties
   - Exhaustive checking: TypeScript ensures all states are handled
   - Clear transitions: Makes state flow explicit

3. Upload Progress Tracking (lib/functions.ts)
   Function: uploadWithProgress
   
   Why XMLHttpRequest instead of fetch()?
   - fetch() API does not support upload progress events
   - XMLHttpRequest provides upload.progress event
   
   Flow:
   1. Create FormData with file
   2. Initialize XMLHttpRequest
   3. Attach progress listener (updates percentage)
   4. Send POST request to backend
   5. Resolve promise with parsed JSON response
   6. Reject on error/timeout
   
   Error Handling:
   - Network errors: "Network error - could not connect to server"
   - HTTP errors: "Upload failed with status XXX"
   - JSON parsing errors: "Invalid JSON response"

FILE VALIDATION
---------------
Location: FileInput.tsx > validateFile function

Checks:
1. File size: Must be ≤ 10MB (10 * 1024 * 1024 bytes)
   Reason: Gemini API limits, reasonable UX
   
2. File type: Must be application/pdf
   Reason: Backend only processes PDFs
   
Applied:
- Before upload (client-side)
- Via React Hook Form validation
- Displays inline error if validation fails

CUSTOM FILE INPUT DESIGN
-------------------------
Problem: Native file inputs ignore placeholder attribute and look ugly

Solution:
1. Hide native input with className="hidden"
2. Create custom "Choose File" button
3. Use ref to trigger native input click
4. Track file selection via onChange handler
5. Display selected filename or hint text

Benefits:
- Full styling control
- Better UX (clear file selection state)
- Disabled state during upload/analysis
- File size/type hints visible

UI STATES & FEEDBACK
---------------------

1. Idle State
   Display: File input form only
   Actions: Choose file, click Analyze

2. Uploading State
   Display:
   - Blue card with progress bar
   - Percentage counter
   - "Uploading file..." message
   Features:
   - Smooth progress bar animation (transition-all duration-300)
   - Real-time percentage updates
   - Input/button disabled

3. Analyzing State
   Display:
   - Yellow/orange gradient card
   - Animated pulsing lightbulb icon
   - Bouncing dots animation (staggered)
   - "Our AI is reading..." message
   - Retry attempt counter (if applicable)
   Features:
   - Eye-catching animations keep user engaged
   - Clear indication processing is happening

4. Success State
   Display:
   - Large green gradient card
   - Success checkmark icon
   - Document title
   - Executive summary section
   - Key highlights (numbered list)
   - Main topics (colorful pills)
   - Metadata footer (file size, timestamp)
   - "Analyze Another Document" button
   
   Visual Hierarchy:
   - Title: 3xl font, bold, top
   - Summary: White card with blue icon
   - Key points: White card with purple icon, numbered
   - Topics: Gradient pills, visually distinct
   
   Icons Used:
   - Success: Checkmark in green circle
   - Summary: Document icon
   - Key points: Clipboard icon
   - Topics: Tag icon
   - Metadata: File and clock icons

5. Error State
   Display:
   - Red gradient card
   - X icon in red circle
   - Error message
   - "Try Again" button (if retryable)
   - "Choose Different File" button
   
   Error Categories:
   - No file selected: canRetry = false
   - File too large: canRetry = false
   - Wrong file type: canRetry = false
   - Network error: canRetry = true
   - Server error: canRetry = true

STYLING APPROACH
-----------------
Framework: Tailwind CSS

Key Patterns:
1. Gradient backgrounds for visual interest
   - from-green-50 to-blue-50
   - from-yellow-50 to-orange-50
   - from-red-50 to-pink-50

2. Card-based layouts
   - rounded-2xl (larger radius for modern look)
   - shadow-lg (depth)
   - border-2 (defined boundaries)

3. Icon + content pattern
   - Colored background circles for icons
   - Left-aligned icons, right-aligned content
   - shrink-0 on icons (prevents squishing)

4. Responsive spacing
   - gap-3, gap-4 (consistent spacing)
   - mb-6, mt-8 (vertical rhythm)
   - p-5, p-6 (breathing room)

5. Interactive states
   - hover:bg-blue-600 (feedback on hover)
   - disabled:bg-gray-400 (clear disabled state)
   - transition-colors (smooth state changes)

ACCESSIBILITY CONSIDERATIONS
-----------------------------
- Semantic HTML (form, button, label elements)
- Labels associated with inputs (htmlFor/id)
- Disabled state prevents interaction during processing
- Error messages clearly displayed
- Color not sole indicator (icons + text)
- Focus states on interactive elements
- Keyboard navigation supported

PERFORMANCE OPTIMIZATIONS
--------------------------
1. Client-side validation prevents unnecessary uploads
2. Progress tracking shows user real-time feedback
3. Discriminated unions enable exhaustive type checking
4. React Hook Form reduces re-renders vs manual state
5. Tailwind CSS purges unused styles in production

KNOWN LIMITATIONS
-----------------
1. Frontend-only progress tracking
   - Upload progress works
   - Analysis progress unknown (backend doesn't stream)
   - Could add SSE/WebSocket for real-time backend updates

2. No persistent storage
   - Analysis results lost on page refresh
   - Could add localStorage or database integration

3. Single file at a time
   - No batch upload support
   - Could extend to accept multiple files

4. No authentication
   - Anyone can use the service
   - Could add user accounts for history/limits

FUTURE ENHANCEMENTS
-------------------
1. Export summary as PDF/TXT
2. Copy to clipboard functionality
3. Comparison mode (upload multiple docs)
4. Authentication & user history
5. Real-time backend progress updates (SSE)
6. Drag-and-drop file upload
7. Dark mode toggle
8. Mobile responsive improvements
9. Analytics dashboard (usage stats)
10. Rate limiting UI feedback

ENVIRONMENT SETUP
-----------------
Required:
- Node.js 18+ (for Next.js 15)
- npm or yarn

Installation:
1. Clone repository
2. Run: npm install
3. Run: npm run dev
4. Open: http://localhost:3000

Dependencies (key):
- next: ^15.0.0
- react: ^18.0.0
- react-hook-form: ^7.x
- tailwindcss: ^3.x
- typescript: ^5.x

DEBUGGING TIPS
--------------
1. Check browser console for frontend errors
2. Network tab shows upload request/response
3. Check FormData contents in Network > Payload
4. Verify CORS headers in Network > Response Headers
5. Test file validation with various file types/sizes
6. Use React DevTools to inspect component state

TESTING CHECKLIST
-----------------
Manual Testing:
[ ] Upload valid PDF (< 10MB)
[ ] Upload file > 10MB (should show error)
[ ] Upload non-PDF file (should show error)
[ ] Click submit without selecting file (should show error)
[ ] Cancel upload mid-process (should handle gracefully)
[ ] Upload while offline (should show network error)
[ ] Try multiple uploads in succession
[ ] Test "Analyze Another Document" button
[ ] Test "Try Again" on error
[ ] Verify summary displays correctly
[ ] Check responsive design on mobile

DEPLOYMENT NOTES
----------------
Build Command: npm run build
Start Command: npm run start
Port: 3000 (configurable via environment)

Environment Variables:
None required for frontend (backend URL hardcoded)

Recommended:
Create NEXT_PUBLIC_API_URL for production deployment

Production Checklist:
[ ] Replace localhost:8000 with production API URL
[ ] Enable error tracking (Sentry, LogRocket)
[ ] Add analytics (Google Analytics, Plausible)
[ ] Configure CDN for static assets
[ ] Enable compression
[ ] Set up monitoring/uptime checks

=============================================================================