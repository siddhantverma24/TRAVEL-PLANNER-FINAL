# Use Python 3.11 slim image as base (lightweight, ~160MB, no extra system packages)
FROM python:3.11-slim

# Set working directory to /app (all subsequent commands run from this directory)
WORKDIR /app

# Install curl for healthcheck (required to verify Flask is ready before frontend starts)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt first (enables Docker layer caching for faster rebuilds when code changes)
COPY requirements.txt .

# Upgrade pip to the latest version (ensures best package compatibility)
RUN pip install --upgrade pip

# Install Python packages from requirements without caching (--no-cache-dir saves image space)
RUN pip install --no-cache-dir -r requirements.txt

# Copy all remaining source code into the container (after pip install to leverage caching)
COPY . .

# Create a non-root user 'appuser' for security (prevents running as root in container)
RUN useradd -m -u 1000 appuser

# Change ownership of /app directory to appuser (allows user to read/write files if needed)
RUN chown -R appuser:appuser /app

# Switch to appuser for running the application (security best practice - limits damage from exploits)
USER appuser

# Expose port 5000 (documents that container listens on this port internally)
EXPOSE 5000

# Set default command to run Flask development server (listens on all interfaces for Docker access)
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
