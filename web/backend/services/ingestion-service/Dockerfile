# Build Stage
FROM golang:1.24-alpine AS builder
ARG CACHEBUST=1
WORKDIR /app

COPY . .
RUN go mod tidy

RUN go build -o ingestion-service ./web/backend/services/ingestion-service/cmd/main.go

# Run Stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/ingestion-service .
RUN touch offline_data.log

EXPOSE 8080
CMD ["./ingestion-service"]