# FROM node:22-alpine
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci
# COPY . .
# EXPOSE 4200
# CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--configuration", "production", "--disable-host-check"]
# ---- Build Stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# สั่ง Build โปรเจกต์
RUN npx ng build --configuration production

# ---- Production Stage (Nginx) ----
FROM nginx:stable-alpine

# 1. ลบไฟล์ขยะเดิมของ Nginx ออกก่อน
RUN rm -rf /usr/share/nginx/html/*

# 2. ก๊อปปี้ไฟล์จากขั้นตอน build (ใช้ /browser เพราะเป็นมาตรฐาน Angular รุ่นใหม่)
COPY --from=build /app/dist/music-therapy/browser /usr/share/nginx/html

# 3. สร้างไฟล์ Config ของ Nginx ใหม่ เพื่อแก้ปัญหา 404 เวลา Refresh หน้าเว็บ
# และช่วยให้มั่นใจว่า Nginx ฟังพอร์ต 80 จริงๆ
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]