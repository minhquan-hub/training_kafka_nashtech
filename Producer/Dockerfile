FROM node:18-alpine3.15
WORKDIR /app
COPY package.json /app
COPY producer.js /app
RUN npm install
CMD ["npm", "start"]
