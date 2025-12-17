# 1. Build Aşaması
FROM golang:1.25.5-alpine AS builder

WORKDIR /app

# ... önceki adımlar

COPY go.mod go.sum ./
RUN go mod download
# Yeni: Bağımlılıkları düzenlemek ve senkronize etmek için 'tidy' eklemek faydalı olabilir
RUN go mod tidy
COPY . .
RUN go build -o ingestion-service ./cmd/main.go

# ...

# 2. Run Aşaması
FROM alpine:latest

WORKDIR /root/
COPY --from=builder /app/ingestion-service .

CMD ["./ingestion-service"]