FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 80
ENV PORT=80
ENV HOST=0.0.0.0
CMD ["npm", "run", "start"]

# Run the startup script 
# COPY startup.sh /startup.sh
# RUN chmod +x /startup.sh
# RUN ls -l /startup.sh
# ENTRYPOINT ["/bin/sh", "/startup.sh"]
