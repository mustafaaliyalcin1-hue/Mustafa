# J.A.R.V.I.S. sunucusu — Railway / Fly.io / herhangi bir Docker barındırıcısı için
# (Render'da Dockerfile gerekmez: kök dizindeki render.yaml kullanılır)
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data
EXPOSE 8080
CMD ["npm", "start"]
