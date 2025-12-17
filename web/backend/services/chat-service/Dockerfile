# Build Stage
FROM golang:1.24-alpine AS builder
ARG CACHEBUST=1
WORKDIR /app

COPY . .
RUN go mod tidy

RUN go build -o chat-service ./web/backend/services/chat-service/cmd/main.go

# Run Stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/chat-service .

EXPOSE 8082
CMD ["./chat-service"]
