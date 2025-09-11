import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
// Usage: Apply @Public() to controller methods that should be accessible without authentication.
// Example:
// @Public()
// @Get('public-endpoint')
// getPublicData() {
//   return "This endpoint is public";
// }
// In your AuthGuard, check for this metadata to bypass authentication for public routes.
