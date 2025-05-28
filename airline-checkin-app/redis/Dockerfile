# 1. Use an official lightweight Python image
FROM python:3.11-slim

# 2. Set a working directory
WORKDIR /usr

# 3. Install pip dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy your application code
#    (assumes your .py files live under ./app)
# Copy code + scripts
COPY src/ ./src/
COPY entrypoint.sh ./

RUN chmod +x entrypoint.sh

# 5. Expose the port your app listens on
EXPOSE 5000
ENTRYPOINT ["./entrypoint.sh"]

# 6. Default command to launch your API
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
