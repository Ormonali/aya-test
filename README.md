# Data Import and Rewards API

This project consists of two main components:

1. Data Importer: Imports employee data from a dump file into a PostgreSQL database.
2. Rewards API: Provides an endpoint to calculate rewards for eligible employees based on their charitable donations.

## Data Importer

### File Format and Objective

The dump file is a plain text format representing objects with properties and other nested objects. The objective is to parse this file and import the data into a PostgreSQL database.

### Setup and Usage

1. Install dependencies: `npm install`
2. Configure environment variables by changing a `.env` file
3. Run data import: `npm run import`

## Rewards API

### Objective

The API endpoint `/rewards` calculates rewards for eligible employees based on their charitable donations.

### Setup and Usage

1. Install dependencies: `npm install`
2. Configure environment variables by changing a `.env`
3. Start the server: `npm start`
4. Access the API endpoint: `http://localhost:3000/rewards`

### API Endpoint

- **GET /rewards**: Calculates rewards for eligible employees based on their charitable donations.

## Questions

### Objective

Demonstrate that the design decisions made in the project are solid by answering the following questions.

1. **How to Change the Code to Support Different File Versions?**

   - Describe how the code can be modified to accommodate different versions of the dump file.

2. **How Will the Import System Change if Data on Exchange Rates Disappears from the File and Needs to Be Received Asynchronously (via API)?**

   - Explain the changes required in the import system to handle asynchronous retrieval of exchange rates from an external API.

3. **In the Future, the Client May Want to Import Files via the Web Interface. How Can the System Be Modified to Allow This?**
   - Outline the modifications needed in the system to enable file uploads via a web interface.

### Answers

1. **Supporting Different File Versions**:

   - Implement parsers for different file versions using version identification and version-specific parsing logic.

2. **Handling Asynchronous Exchange Rate Retrieval**:

   - Modify the import system to fetch exchange rates asynchronously from an external API before processing donations.

3. **Importing Files via Web Interface**:
   - Add an endpoint in the Express application to handle file uploads and integrate a simple web interface for user convenience.

## Contributors

- [Ormonali Kaarov](https://github.com/Ormonali)
