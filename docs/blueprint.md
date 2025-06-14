# **App Name**: Claim Clarity

## Core Features:

- UI Layout: Responsive layout for hospital selection and claim identifier inputs, optimized for mobile and desktop.
- Form Validation: Client-side validation to ensure mandatory fields are filled and field-level data types are correct (numeric, alphanumeric, alphabetic).
- Search Logic: Asynchronous search logic that connects to a mock backend API based on Claim Number, Policy Number, or Patient Name and Hospital. Includes fuzzy matching for patient names.
- Status Display: Status badge UI to display claim stage, status date, and reference number upon successful search.
- Error Handling: Display a user-friendly "No Record Found" message when no claim matches the search criteria.
- Input Reset: Buttons to clear the form inputs and the search results, so that users can begin again if they entered the wrong query parameters.

## Style Guidelines:

- Primary color: HSL(210, 60%, 50%) - RGB Hex: #4782F0, a professional blue representing trust and stability in healthcare.
- Background color: HSL(210, 20%, 95%) - RGB Hex: #F0F4FF, a light blue for a clean, calming backdrop.
- Accent color: HSL(240, 50%, 50%) - RGB Hex: #6A5ACD, a deep indigo for highlights and interactive elements, creating contrast and visual interest.
- Body and headline font: 'Inter', sans-serif for a clean, modern, and readable experience.
- Use clear and intuitive icons to represent different claim statuses and actions.
- Mobile-first, responsive layout with clear spacing and consistent design to enhance usability on all devices.
- Subtle animations to indicate loading states and interactive feedback on user actions.