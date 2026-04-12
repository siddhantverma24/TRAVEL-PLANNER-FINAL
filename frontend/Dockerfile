# Use Nginx Alpine image as base (extremely small, ~7MB, perfect for web serving)
FROM nginx:alpine

# Remove default Nginx configuration (to be replaced with custom config)
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx.conf for static serving and API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all frontend static files to Nginx serving directory
COPY . /usr/share/nginx/html

# Expose port 80 (standard HTTP port for web traffic)
EXPOSE 80

# Set default command to run Nginx in foreground (required for Docker to keep container alive)
CMD ["nginx", "-g", "daemon off;"]
