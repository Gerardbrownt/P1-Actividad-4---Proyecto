FROM node:20-alpine as build-stage
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build-stage /app/dist ./client/dist
COPY server.js .
EXPOSE 8080
CMD ["node", "server.js"]