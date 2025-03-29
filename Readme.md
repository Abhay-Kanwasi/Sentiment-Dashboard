# Sentiment Dashboard

A web-based application for analyzing the sentiment of product reviews using advanced NLP models.

## Description

This project provides a comprehensive solution for sentiment analysis, combining a FastAPI backend with a React frontend. The application allows users to upload CSV files containing product reviews, analyze the sentiment using a pre-trained DistilBERT model, and visualize the results through an interactive dashboard. The application consists of two main components:

1. **Backend API**: Built using FastAPI, providing endpoints for sentiment analysis of text data.
2. **Frontend Dashboard**: A user-friendly interface (built with React or similar framework) that visualizes the sentiment analysis results.

## Features

- **Sentiment Analysis API**:
  - Analyze text data from CSV files.
  - Supports batch processing of reviews.
  - Provides detailed sentiment results including confidence scores.
  - Returns summary statistics and visualizable data.

- **Dashboard Features**:
  - File upload functionality for CSV files.
  - Visual representations of sentiment data through charts.
  - Tabular view of processed reviews with sentiment labels.
  - Summary statistics dashboard.

## Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Abhay-Kanwasi/Sentiment-Dashboard.git
   
   cd Sentiment Dashboard/backend
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   # OR
   .\venv\Scripts\activate  # On Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Sentiment Dashboard/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Running the Backend

1. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`.

### Running the Frontend

1. Start the frontend development server:
   ```bash
   npm run dev
   ```

   The dashboard will be available at `http://localhost:3000`.

## API Documentation

### `/analyze` Endpoint

- **Method**: POST
- **Description**: Analyzes the sentiment of product reviews provided in a CSV file.
- **Request Body**:
  - `file`: CSV file containing a 'review' column with text data.
- **Response**:
  ```json
  {
    "summary": {
      "positive_count": int,
      "negative_count": int,
      "positive_avg_confidence": float,
      "negative_avg_confidence": float,
      "total_reviews": int
    },
    "reviews": [
      {
        "review": str,
        "sentiment": str,
        "confidence": float
      }
    ]
  }
  ```

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear commit messages.
4. Push to the branch.
5. Open a Pull Request against the `main` branch.


## Future Improvements

- Add more detailed error handling and validation.
- Implement user authentication for access control.
- Add support for different types of input files and data sources.
- Enhance the dashboard with additional visualizations and interactive features.