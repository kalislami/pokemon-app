FROM node:18.19

WORKDIR /app

COPY . .

RUN npm install

ENTRYPOINT npm run dev