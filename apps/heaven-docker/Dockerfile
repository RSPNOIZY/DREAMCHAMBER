FROM node:20-alpine

WORKDIR /app

# Install wrangler for local dev mode
RUN npm install -g wrangler

# Copy Heaven worker source
COPY heaven-worker/ ./heaven-worker/

WORKDIR /app/heaven-worker
RUN npm install

EXPOSE 8787

# Run wrangler dev in local mode (no Cloudflare account needed)
CMD ["npx", "wrangler", "dev", "--local", "--port", "8787", "--ip", "0.0.0.0"]
