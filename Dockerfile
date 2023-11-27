FROM node:14.15

WORKDIR /app/olm_app
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000