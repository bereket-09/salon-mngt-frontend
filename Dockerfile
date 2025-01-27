# Use an official NGINX image
FROM mdc1-sfcr.safaricomet.net/vas/nginx:stable

# Copy the React build to NGINX's HTML directory
COPY dist /usr/share/nginx/html

# Copy a custom NGINX configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
