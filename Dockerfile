FROM node:17-bullseye-slim

# Metadata
WORKDIR /usr/src/app
EXPOSE 3000

# Install Nest
RUN npm i -g @nestjs/cli

# Copy dependencies list
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app sources
COPY . .

# Run app
CMD ["nest", "start"]
