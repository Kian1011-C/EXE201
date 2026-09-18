FROM node:20-alpine

# Install openssl for Prisma compatibility on alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 5000

COPY entrypoint.sh ./
RUN sed -i 's/\r$//' ./entrypoint.sh && chmod +x ./entrypoint.sh

CMD ["./entrypoint.sh"]
