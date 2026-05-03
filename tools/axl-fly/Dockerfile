FROM golang:1.25.5-bookworm AS builder

WORKDIR /src
RUN git clone --depth 1 https://github.com/gensyn-ai/axl.git .
RUN go build -o /out/node ./cmd/node

FROM debian:bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl openssl tcpdump \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /out/node /app/node
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 9001/tcp
CMD ["/app/start.sh"]
