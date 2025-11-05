# **App Name**: Bank Proposal Automation

## Core Features:

- Data Extraction and Structuring: Extract data from documents and structure them in a consistent format, and make sure the structure is reflected in the forms that user will use. A LLM tool helps in understanding variations in document formats.
- Bank Selection UI: A UI component that presents the list of banks for proposal submission, organized into categories (Qualibanking, Credfranco, etc.) based on source data.
- Proposal Submission Automation: Automate the submission of proposals to different banks based on predefined rules and data.
- Priority Handling: Prioritize proposal submissions based on the 'Prioridades' section and deadlines. Color-coding in the interface to indicate priorities is important.
- Data Logging and Audit Trail: Maintain a log of all actions performed within the system, for compliance and audit purposes. Store the actions to a database for future processing

## Style Guidelines:

- Primary color: Deep Blue (#1A5276) for trustworthiness and stability, reflecting the financial context.
- Background color: Light Gray (#E5E8E8), providing a neutral backdrop to ensure legibility and focus on data.
- Accent color: Teal (#2E86AB) to highlight key actions and priority items, contrasting with the primary color.
- Headline font: 'Inter', sans-serif, for clean and modern headings.
- Body font: 'Inter', sans-serif, to maintain a consistent, readable style throughout the application.
- Use minimalist, professional icons for bank categories, priorities, and submission statuses.
- Divide bank tables in different components according the OCR text divisions to help navigate faster through bank proposal.