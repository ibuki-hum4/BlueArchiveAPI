FROM golang:1.26-alpine AS builder
WORKDIR /src

COPY go.mod go.sum ./
COPY internal ./internal
COPY cmd ./cmd

RUN go mod download && go build -o /out/export_students ./cmd/export_students

FROM alpine:3.20
WORKDIR /app

RUN apk add --no-cache git openssh-client && \
    mkdir -p /home/export && chown 1000:1000 /home/export

ENV HOME=/home/export

COPY --from=builder /out/export_students /app/export_students
COPY cmd/export_students/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
