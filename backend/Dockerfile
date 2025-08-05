# Use Node.js 20 as the base image
FROM node:20-alpine

# Create and set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm ci --only=production && \
    npm cache clean --force

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Set Node.js to production mode
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "server.js"]