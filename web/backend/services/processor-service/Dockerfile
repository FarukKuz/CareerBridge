# Build Stage
FROM golang:1.24-alpine AS builder
ARG CACHEBUST=1
WORKDIR /app

COPY . .
RUN go mod tidy

RUN go build -o processor-service ./web/backend/services/processor-service/main.go

# Run Stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/processor-service .

CMD ["./processor-service"]