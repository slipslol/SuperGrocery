FROM python:3.11-alpine

RUN pip install --no-cache-dir flask

WORKDIR /app
COPY app/ /app/

EXPOSE 8099
CMD ["python3", "server.py"]
