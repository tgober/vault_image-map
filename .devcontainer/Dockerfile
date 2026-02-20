# Offizielles Node-Image (LTS) – reicht zum Bauen
FROM node:20-bullseye

# Arbeitsverzeichnis
WORKDIR /workspaces/vault_image-map

# Optional: nur damit "npm ci" schneller ist (wenn package.json vorhanden ist)
COPY package*.json ./
RUN npm install -g npm@latest
