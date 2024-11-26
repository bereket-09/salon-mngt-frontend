# Use the unprivileged NGINX image
FROM mdc1-sfcr.safaricomet.net/library/nginxinc/nginx-unprivileged:1.20

# Copy the NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the dist folder into NGINX's HTML directory
COPY dist /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000
