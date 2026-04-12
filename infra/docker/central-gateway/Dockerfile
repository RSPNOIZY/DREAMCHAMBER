FROM node:22-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY package.json server.js ./
EXPOSE 9696
CMD ["node", "server.js"]
