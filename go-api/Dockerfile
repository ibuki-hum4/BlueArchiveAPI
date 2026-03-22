FROM golang:1.22-alpine AS builder
WORKDIR /src

COPY go.mod go.sum ./
COPY main.go ./
COPY internal ./internal

RUN go mod download && go build -o /out/go-api ./main.go

FROM alpine:3.20
WORKDIR /app

ENV PORT=8080
ENV STUDENTS_DATA_PATH=/app/data/students.json

COPY --from=builder /out/go-api /app/go-api

EXPOSE 8080

CMD ["/app/go-api"]
