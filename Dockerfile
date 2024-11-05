# Use an official Node.js runtime as a parent image
FROM mdc1-sfcr.safaricomet.net/vas/node:20-alpine

# Set the working directory inside the container to /app
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy the dist folder to the container
COPY dist ./dist

# Expose port 3000 for the application
EXPOSE 3000

# Serve the application using serve
CMD ["serve", "-s", "dist", "-l", "3000"]
