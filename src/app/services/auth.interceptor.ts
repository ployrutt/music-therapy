import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);
//   const token = authService.getToken();

//   if (token) {
//     const cloned = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     return next(cloned);
//   }

//   return next(req);
  
// };

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ✅ ดึงจาก localStorage โดยตรงเพื่อป้องกันปัญหาค่าใน Service เป็น null หลัง Refresh
  const token = localStorage.getItem('token');

  // เพิ่ม Log เพื่อเช็คในหน้า Console (F12)
  console.log('Interceptor Debugging...');
  console.log('Request URL:', req.url);
  console.log('Token found in Storage:', token ? 'Yes' : 'No');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        // ต้องมั่นใจว่า "Bearer" สะกดถูกและมีเคาะเว้นวรรค 1 ครั้ง
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};