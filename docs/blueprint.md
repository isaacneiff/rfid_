# **App Name**: AccessKey

## Core Features:

- Entry/Exit Control Page: A page with a clear visual interface to display the last recorded access data, showing entry and exit logs in real time.
- Real-time Logging: Log all entry and exit events including timestamp and RFID.
- RFID Scanner Integration: The application will integrate with an RFID scanner (such as RC522 connected to Arduino) to read unique IDs from RFID cards. Note that Arduino integration and reading will not occur within the NextJS application. NextJS will receive data via API from the Arduino. Details on SUPABASE API endpoints will be available later.
- Data Presentation Tool: When presenting data from the RFID cards, the app will use a reasoning tool to ensure that any card data can be checked against existing access and permission tables.
- Registration Page: Allow administrators to register new RFID cards and link them to user profiles in SUPABASE. Data entry screens can read block and card metadata from cards.
- Access Log: Maintain an access log in local storage.

## Style Guidelines:

- Primary color: Deep teal (#008080) to suggest both access and technology.
- Background color: Very light greenish gray (#F0FAF9).
- Accent color: A golden yellow (#FFC107) is chosen for highlighting data in tables and when user interactions are required in the interface.
- Font: 'Inter' (sans-serif) for clear, modern UI.
- Code font: 'Source Code Pro' for displaying card block or similar data.
- Clean and sectioned layouts to display access data.
- Subtle animations on RFID scan and log updates to give feedback to the user