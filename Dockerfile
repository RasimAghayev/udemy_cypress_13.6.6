FROM cypress/included:latest
WORKDIR /app
COPY . /app
RUN npm config set force false && npm install -g npm@latest &&  npm cache clean --force && npm cache verify && npm install --force && npx cypress verify
CMD ["npx","cypress","run"]