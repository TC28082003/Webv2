# Web_waidiagmed/app/Dockerfile

# The base Node.js image
FROM node:18-slim AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

#Install dependencies
RUN npm install

# Copy the rest of application code
COPY . .

# Default port
EXPOSE 3001

# The command to run application
CMD [ "node", "server.js" ]