FROM node:20-bookworm

RUN apt-get update && \
    apt-get install -y \
        cmake \
        build-essential \
        ffmpeg \
        git \
        python3 \
        make \
        g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

EXPOSE 10000

CMD ["npm", "start"]