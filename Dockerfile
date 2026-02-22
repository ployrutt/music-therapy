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
# สั่ง Build ให้ได้ไฟล์ Static (จะได้โฟลเดอร์ dist/)
RUN npx ng build --configuration production

# ---- Production Stage (Nginx) ----
FROM nginx:stable-alpine
# ก๊อปปี้ไฟล์จากขั้นตอน build มาใส่ใน nginx 
# (ตรวจสอบชื่อโฟลเดอร์ใน dist/ ให้ถูกต้องตามชื่อโปรเจกต์คุณ)
# COPY --from=build /app/dist/music-therapy-frontend/browser /usr/share/nginx/html
# COPY --from=build /app/dist/music-therapy /usr/share/nginx/html
# เพิ่ม /browser ต่อท้าย path เดิม
COPY --from=build /app/dist/music-therapy/browser /usr/share/nginx/html
# ก๊อปปี้ไฟล์คอนฟิก nginx (ถ้ามี) หรือใช้ค่าเริ่มต้น
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]