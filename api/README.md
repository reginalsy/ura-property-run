# Singapore URA DataService Serverless API

This `/api` directory contains the serverless integration layer connecting to official Singapore Urban Redevelopment Authority (URA) Real Estate Information System (REALIS) private property datasets.

## Architecture

1. **Daily Token Trading (`/api/uraClient.ts`)**:
   - URA requires exchanging an `AccessKey` for a daily session `Token`:
     ```
     GET https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1
     Header: AccessKey: <URA_ACCESS_KEY>
     ```
   - Automatically caches the token in-memory for 23 hours to prevent excessive token calls.

2. **Authenticated Data Calls**:
   - Calls the URA DataService endpoint sending **BOTH** headers (`AccessKey` and `Token`):
     ```
     GET https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=1
     Headers:
       AccessKey: <URA_ACCESS_KEY>
       Token: <SESSION_TOKEN>
     ```
   - Auto-retries with fresh token if the session expires.

3. **Data Normalization (`/api/properties.ts`)**:
   - Converts URA nested project transaction batches into flat `StandardTransaction` objects.
   - Computes square foot conversions (1 sqm = 10.7639 sqft), unit price PSF, and standard postal district identifiers (`D01`–`D28`).

4. **Universal Serverless Entry Point (`/api/index.ts`)**:
   - Mountable as a Vercel Serverless Function, AWS Lambda handler, or Express route.
   - Endpoints:
     - `GET /api/properties/transactions`: Returns normalized transaction records with search/district/segment filters.
     - `GET /api/properties/stats`: Returns calculated median PSF, average price, and CCR/RCR/OCR distribution.
     - `GET /api/properties/health`: Diagnostic health check indicating if `URA_ACCESS_KEY` is loaded.
     - `GET /api/properties/token`: Directly returns today's traded URA token.

## Environment Variables

- `URA_ACCESS_KEY`: Your URA DataService Developer Access Key. Do NOT hardcode this in source code; set it in `.env` or your cloud deployment environment variables.
