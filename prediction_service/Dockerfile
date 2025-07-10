# prediction_service/Dockerfile

# Use the official Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /usr/src/app

# Install necessary system packages (if any)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc

# Copy requirements file and install library
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire source code of the service
COPY . .

# Expose the port that Gunicorn will run on
EXPOSE 5001

# Command to run application using Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--timeout", "180", "app:app"]
