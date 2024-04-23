FROM cypress/included:latest
WORKDIR /app
COPY . /app
RUN npm install && npx cypress verify
CMD ["npx","cypress","run"]